'use client'

import { Footer } from '@/components/Footer'
import Header from '@/components/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
      <div className="relative flex w-full flex-col justify-between">
        <Header />
        <main className="lg:grid md:grid divide-y justify-items-center">{children}</main>
        <Footer />
      </div>
  )
}
