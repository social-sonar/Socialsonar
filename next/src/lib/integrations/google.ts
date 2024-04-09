import { google, people_v1 } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/contacts.readonly'];


const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL,
);

export function authUrl(): string {
    const url = oauth2Client.generateAuthUrl({
        scope: SCOPES,
        redirect_uri: process.env.REDIRECT_URL,
        prompt: 'consent'
    });
    return url
}

export async function sync(code: string): Promise<people_v1.Schema$Person[]> {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens);
    const people = google.people({ version: 'v1', auth: oauth2Client })
    const res = await people.people.connections.list({
        resourceName: 'people/me',
        sortOrder: 'LAST_MODIFIED_DESCENDING', 
        pageSize: 10,
        personFields: 'names,emailAddresses,addresses,phoneNumbers,photos,organizations,occupations',
    });
    return res.data.connections || [];
}