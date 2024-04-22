import { google, Auth } from 'googleapis';
import { GoogleResponse } from '../definitions';

// Define scopes and redirect URL
const SCOPES = ['https://www.googleapis.com/auth/contacts'];

export function createOAuth2Client(tokens?: Auth.Credentials): Auth.OAuth2Client {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.REDIRECT_URL,
    );
    
    if (tokens) {
        oauth2Client.setCredentials(tokens);
    }
    
    return oauth2Client;
}

export function generateAuthUrl(oauth2Client: Auth.OAuth2Client): string {
    return oauth2Client.generateAuthUrl({
        scope: SCOPES,
        prompt: 'consent'
    });
}

export async function syncContacts(oauth2Client: Auth.OAuth2Client, code: string): Promise<GoogleResponse[]> {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const people = google.people({ version: 'v1', auth: oauth2Client });
    const res = await people.people.connections.list({
        resourceName: 'people/me',
        sortOrder: 'LAST_MODIFIED_DESCENDING',
        pageSize: 1000,
        personFields: 'names,emailAddresses,addresses,phoneNumbers,photos,organizations,occupations',
    });
    return res.data.connections || [];
}