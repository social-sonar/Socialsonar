# Blackbookcleaner

Blackbookcleaner allows you to sync your contacts with your phone. This means that when you add a contact on your computer, it will automatically be added to your phone and vice versa.

## Getting started

To get started with this template, first install the npm dependencies:

```bash
npm install
```

Next, create a `.env.local` file in the root of your project and set the following variables:

1. **NEXT_PUBLIC_SITE_URL**:
   - Example: **`https://example.com`**
   - Usage: Specifies the public BASE URL.
2. **GOOGLE_CLIENT_ID**:
   - Example: **`abcdefg.apps.googleusercontent.com`**
   - Usage: GCP client ID for syncing google data into the app (auth and contacts)
3. **GOOGLE_CLIENT_SECRET**:
   - Example: **`GOCSPX-abcdefghi`**
   - Usage: GCP client secret for syncing google data into the app (auth and contacts)
4. **AUTH_SECRET**:
   - Example: **`abcd1234`**
   - Usage: Random auth secret, required for OAuth authentication
5. **REDIRECT_URL**:
   - Example: **`https://example.com/`**
   - Usage: Specifies the URI to which users will be redirected after authorizing the usage of their data.
6. **DATABASE_URL**:
   - Example: **`postgresql://foo:bar@localhost:5432/mydb?schema=public`**
   - Usage: Specifies the connection URL that Prisma will use.

Next, run the migration command to initialize the database and ORM:

```bash
npm run migrate
```

Next, run the development server:

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## License

This site template is a commercial product and is licensed under the [Tailwind UI license](https://tailwindui.com/license).

## Learn more

To learn more about the technologies used in this site template, see the following resources:

- [Tailwind CSS](https://tailwindcss.com/docs) - the official Tailwind CSS documentation
- [Next.js](https://nextjs.org/docs) - the official Next.js documentation
- [Headless UI](https://headlessui.dev) - the official Headless UI documentation
- [MDX](https://mdxjs.com) - the MDX documentation
