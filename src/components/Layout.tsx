'use client'

import { Footer } from '@/components/Footer'
import Header from '@/components/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex w-full flex-col justify-between">
      <Header />
      <main className="justify-items-center divide-y md:grid lg:grid">
        {children}
      </main>
      <Footer />
    </div>
  )
}
