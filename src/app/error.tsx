'use client'

import SadFace from '@/images/icons/sad-face.svg'

export default function GlobalErrorPage() {
    return (
        <div className="flex flex-col items-center gap-3 mx-3">
            <div className="bg-gray-600 rounded-full">
                <img src={SadFace.src} alt="SadFace" />
            </div>
            <div>
                <p className='text-center'>Sorry about that</p>
                <p className='text-center'>Please contact the administrator(s) and/or report a bug</p>
            </div>
        </div>
    )
}