'use server'

import nextauth from '@/auth';
import prisma from '@/db';
import { syncGoogleContacts } from '@/lib/data/common';
import { CustomSession, GoogleContactMainResponse } from '@/lib/definitions';
import { GaxiosResponse } from 'gaxios';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { redirect } from 'next/navigation';

async function refreshToken(session: CustomSession, oauth2Client: OAuth2Client) {
    oauth2Client.setCredentials({ refresh_token: session.refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    session.accessToken = credentials.access_token!;
    session.expiresAt = Date.now() + credentials.expiry_date!;
    oauth2Client.setCredentials({ access_token: session.accessToken });
}

export async function fetchGoogleContacts(userId: string) {
    const session = await nextauth.auth() as CustomSession


    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.REDIRECT_URL,
    );


    oauth2Client.setCredentials({ access_token: session.accessToken });

    // Initialize the Google People API client with the OAuth2 client
    const people = google.people({
        version: 'v1',
        auth: oauth2Client,
    });

    const syncToken = await prisma.googleSyncToken.findFirst({
        where: {
            userId: userId
        },
        select: {
            token: true
        }
    })
    // Fetch the user's Google Contacts
    let res: GaxiosResponse<GoogleContactMainResponse>
    try {
        res = await people.people.connections.list({
            resourceName: 'people/me',
            sortOrder: 'LAST_MODIFIED_DESCENDING',
            pageSize: 1000,
            personFields: 'names,emailAddresses,addresses,phoneNumbers,photos,organizations,occupations,birthdays',
            requestSyncToken: true,
            syncToken: syncToken?.token,
        });
    } catch (error: unknown) {
        try {
            await refreshToken(session, oauth2Client);
            res = await people.people.connections.list({
                resourceName: 'people/me',
                sortOrder: 'LAST_MODIFIED_DESCENDING',
                pageSize: 1000,
                personFields: 'names,emailAddresses,addresses,phoneNumbers,photos,organizations,occupations,birthdays',
                requestSyncToken: true,
                syncToken: syncToken?.token,
            });
        } catch (error: unknown) {
            throw error
        }
    }


    if (syncToken?.token) {
        await prisma.googleSyncToken.update({
            where: {
                userId: userId
            },
            data: {
                token: res.data.nextSyncToken!
            }
        })
    }
    else {
        await prisma.googleSyncToken.create({
            data: {
                userId: userId,
                token: res.data.nextSyncToken!
            }
        })
    }

    if (res.data.connections)
        await syncGoogleContacts(res.data.connections, userId)
    redirect('/contacts-list')
}