'use server'

import { google } from 'googleapis';
import prisma from '@/db';
import { redirect } from 'next/navigation';
import { syncGoogleContacts } from '@/lib/data';

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

    // Fetch the user's Google Contacts
    const res = await people.people.connections.list({
        resourceName: 'people/me',
        sortOrder: 'LAST_MODIFIED_DESCENDING',
        pageSize: 1000,
        personFields: 'names,emailAddresses,addresses,phoneNumbers,photos,organizations,occupations',
    });

    // Handle the response as needed
    if (res.data.connections)
        await syncGoogleContacts(res.data.connections, userId)
    redirect('/contacts-list')
}