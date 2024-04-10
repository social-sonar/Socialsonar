'use client'

import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'


export default function SyncButton({ authUrl, logo, title }: { authUrl: string, logo: StaticImport, title: string }) {
    return (
        <button className='flex py-2 px-3 text-sm rounded-full border-teal-500' onClick={() => location.href = authUrl}>
            <Image src={logo} width={25} height={25} alt='GC' />
            <span className='ml-2'>{title}</span>
        </button>)
}