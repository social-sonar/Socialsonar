'use client'

import { StaticImport } from "next/dist/shared/lib/get-img-props"
import Image from "next/image"
import { useFormStatus } from "react-dom"

export default function SyncButton({ title, logo }: { title: string, logo: StaticImport }) {
    const { pending } = useFormStatus()
    return (
        <button className='flex py-2 px-3 text-sm rounded-full bg-gray-800 active:bg-gray-900 hover:bg-gray-900' type='submit' disabled={pending} >
            {
                pending ? <div className="border-gray-300 h-[25px] w-[25px] animate-spin rounded-full border-2 border-t-blue-600" />
                    : <Image src={logo} width={25} height={25} alt='GC' />
            }
            <span className='ml-2'>{title}</span>
        </button>
    )
}