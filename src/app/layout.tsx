import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import Layout from '@/components/Layout'

import '@/styles/tailwind.css'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: {
    template: '%s - Blackbook cleaner',
    default: APP_NAME,
  },
  description:
    'Blackbook cleaner keeps your contacts organized by eliminating duplicates, updating all your contact details, and identifying missing information.',
  alternates: {
    types: {
      'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL}/feed.xml`,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="apple-touch-icon.png"
      ></link>
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="favicon-32x32.png"
      ></link>
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="favicon-16x16.png"
      ></link>
      <link rel="icon" href="/favicon.ico"></link>
      <body className="flex h-full bg-zinc-50 dark:bg-black relative">
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
