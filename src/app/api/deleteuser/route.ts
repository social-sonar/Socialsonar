// import { findContacts } from '@/lib/data/common'
import { ContactMergeStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { phone } from 'phone'
import prisma from '../../../db'

export async function GET(req: NextRequest) {
  
  const userId = req.nextUrl.searchParams.get('userId') as string
  
  if (!userId){
    return NextResponse.json({status:"userId param not valid"})
  }
    
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      include: {
        accounts: true,
        sessions: true,
        googleSyncTokens: true,
        contact: true,
      },
    });
    return NextResponse.json({status:"success", deletedUser})
  } catch (error) {
    console.log(error);
    
    return NextResponse.json({status:"error", error})    
  }  

}

export async function POST(req: Request) {
  const body = await req.json()
}

export async function PUT(req: Request) {
  const body = await req.json()
}

export async function DELETE(req: Request) {
  const body = await req.json()
}
