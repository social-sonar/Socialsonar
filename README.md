# Social sonar

Social sonar allows you to sync your contacts with your phone. This means that when you add a contact on your computer, it will automatically be added to your phone and vice versa.

## Getting started

To get started with this project, first install the npm dependencies:

```bash
npm install
```

Next, create a `.env.local` file in the root of your project and set the following variables:

1. **NEXT_PUBLIC_SITE_URL**:
   - Example: **`https://socialsonar.vercel.app`**
   - Usage: Specifies the public BASE URL.
2. **DOMAIN**:
   - Example: **`http://localhost:3000`**
   - Usage: Specifies the public BASE URL.
3. **GOOGLE_CLIENT_ID**:
   - Example: **`abcdefg.apps.googleusercontent.com`**
   - Usage: GCP client ID for syncing google data into the app
4. **GOOGLE_CLIENT_SECRET**:
   - Example: **`GOCSPX-abcdefghi`**
   - Usage: GCP client secret for syncing google data into the app (auth and contacts)
5. **AUTH_SECRET**:
   - Example: **`abcd1234`**
   - Usage: Random auth secret, required for OAuth authentication
6. **POSTGRES_PRISMA_URL**:
   - Example: **`postgresql://foo:bar@localhost:5432/mydb?schema=public`**
   - Usage: Specifies the connection pool that Prisma will use.
7. **POSTGRES_URL_NON_POOLING**:
   - Example: **`postgresql://foo:bar@localhost:5432/mydb?schema=public`**
   - Usage: Specifies the connection URL that Prisma will use to run migrations

Next, run the migration command to initialize the database and ORM:

```bash
npm run migrate
```

Next, run the development server and replicate the Vercel deployment environment locally:

```bash
npm run dev:vercel
```

When running the above command, please note that the environment variables from Vercel Development will take priority over your local ones

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Learn more

To learn more about the technologies used in this platform, see the following resources:

- [Tailwind CSS](https://tailwindcss.com/docs) - the official Tailwind CSS documentation
- [Next.js](https://nextjs.org/docs) - the official Next.js documentation
- [Headless UI](https://headlessui.dev) - the official Headless UI documentation
- [MDX](https://mdxjs.com) - the MDX documentation
