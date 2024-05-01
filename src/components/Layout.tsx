'use client'

import { Footer } from '@/components/Footer'
import Header from '@/components/Header'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import BackgroundImage from '/public/bg-home.png'

export default function Layout({ children }: { children: React.ReactNode }) {
  const isHome = usePathname() === '/'

  return (
    <>
      {/* {
        !isHome ? <div className="fixed inset-0 flex justify-center sm:px-8">
          <div className="flex w-full max-w-7xl lg:px-8">
            <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
          </div>
        </div> :
          <div className='absolute inset-0 -z-20 overflow-hidden'>

            <div className='relative h-full w-full -right-[45%]'>
              <Image
                src={BackgroundImage}
                alt='bg-img'
                fill
                style={{ objectFit: 'contain' }}
                />
            </div>
          </div>
      } */}
      <div className="relative flex w-full flex-col justify-between">
        <Header />
        <main className="lg:grid md:grid divide-y justify-items-center">{children}</main>
        <Footer />
      </div>
    </>
  )
}
