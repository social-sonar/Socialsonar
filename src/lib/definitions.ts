import { Prisma, Contact } from '@prisma/client'
import { people_v1 } from 'googleapis'


export type GoogleResponse = people_v1.Schema$Person

export type ContactCreate = Prisma.ContactUncheckedCreateInput;

export type { Contact }