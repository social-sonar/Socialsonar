'use client'

import { Footer } from '@/components/Footer'
import Header from '@/components/Header'
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const shouldGrow = pathname.startsWith('/u/');
  return (
    <div className="relative flex w-full flex-col justify-between">
      <Header />
      <main className={`justify-items-center divide-y md:grid lg:grid ${shouldGrow && 'grow grid'}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
