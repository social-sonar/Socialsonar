import EventDatePicker from "@/components/EventDatePicker"
import prisma from "@/db"

type EventsProps = {
    params: {
        id: string,
        duration: string
    },
    searchParams: {
        month: string,
        date?: string
    }
}


export default async function Events({ params, searchParams }: EventsProps) {
    const user = await prisma.user.findUnique({
        where: {
            id: params.id
        }
    })
    return (
        <div className='flex flex-col justify-center gap-10'>
            <EventDatePicker
                dateString={searchParams.date}
                duration={params.duration}
                month={searchParams.month}
                userName={user?.name!}
            />
        </div>

    )
}