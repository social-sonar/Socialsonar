'use client'

import { StaticImport } from "next/dist/shared/lib/get-img-props"
import Image from "next/image"
import { useFormStatus } from "react-dom"
import LoadingSpinner from "./spinner"

export default function SyncButton({ title, logo }: { title: string, logo: StaticImport }) {
    const { pending } = useFormStatus()
    return (
        <button className='flex py-2 px-3 text-sm rounded-full bg-gray-800 active:bg-gray-900 hover:bg-gray-900' type='submit' disabled={pending} >
            {
                pending ?
                    <LoadingSpinner size={25} /> :
                    <Image src={logo} width={25} height={25} alt='GC' />
            }
            <span className='ml-2'>{title}</span>
        </button>
    )
}