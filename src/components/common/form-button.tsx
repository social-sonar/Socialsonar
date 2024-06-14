'use client'

import { StaticImport } from "next/dist/shared/lib/get-img-props"
import Image from "next/image"
import { useFormStatus } from "react-dom"
import LoadingSpinner from "./spinner"
import React from "react"

export function SyncButton({ title, logo }: { title: string, logo: StaticImport }) {
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

export function FormButton({ className, children }: { className?: string, children?: React.ReactElement | string}) {
    const { pending } = useFormStatus()
    return (
        <button className={`flex gap-2 bg-gray-700 hover:bg-gray-800 p-2 rounded-md ${className} ${pending && 'cursor-not-allowed'}`} disabled={pending} type="submit" >
            {
                pending &&
                <LoadingSpinner size={25} />
            }
            <span>{children}</span>
        </button>
    )
}