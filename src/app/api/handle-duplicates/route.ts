import { keepDuplicatedContacts, keepSelectedContact, mergeContacts } from "@/lib/data/common";
import { DuplicateContactResolutionPayload, ResolutionStrategy } from "@/lib/definitions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const data: DuplicateContactResolutionPayload = await req.json()
    switch (data.strategy) {
        case ResolutionStrategy.KEEP_ONE:
            await keepSelectedContact(data.contactA!, data.contactB!)
            break
        case ResolutionStrategy.KEEP_BOTH:
            await keepDuplicatedContacts(data.contactA!, data.contactB!)
            break
        case ResolutionStrategy.MERGE:
            await mergeContacts(data.contactA!, data.contactB!, data.mergeName)
            break
    }
    return NextResponse.json(data)
}