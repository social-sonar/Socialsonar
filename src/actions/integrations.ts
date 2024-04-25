'use server'

import { google } from 'googleapis';
import prisma from '@/db';
import { redirect } from 'next/navigation';
import { syncGoogleContacts } from '@/lib/data/common';

export async function fetchGoogleContacts(userId: string) {
    // Create a new OAuth2 client with your app's credentials and set the access token
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.REDIRECT_URL,
    );
    const account = await prisma.account.findFirst({ where: { userId: userId } })
    oauth2Client.setCredentials({ access_token: account?.access_token });

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
    const res = await people.people.connections.list({
        resourceName: 'people/me',
        sortOrder: 'LAST_MODIFIED_DESCENDING',
        pageSize: 1000,
        personFields: 'names,emailAddresses,addresses,phoneNumbers,photos,organizations,occupations',
        requestSyncToken: true,
        syncToken: syncToken?.token,
    });

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

    // Handle the response as needed
    if (res.data.connections)
        // TODO: add logic to handle duplicates
        await syncGoogleContacts(res.data.connections, userId)
    redirect('/contacts-list')
}