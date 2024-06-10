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


const checkMonth = (month: string): boolean => {
    const dateFromMonth = new Date(month)
    const currentDate = new Date()
    const updatedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0)
    updatedDate.setUTCHours(0)
    return dateFromMonth >= updatedDate
}

export default async function Events({ params, searchParams }: EventsProps) {
    const isValidMonth = checkMonth(searchParams.month)
    const user = await prisma.user.findUnique({
        where: {
            id: params.id
        }
    })
    return (
        <>
            {
                isValidMonth ?
                    <div className='flex flex-col justify-center gap-10'>
                        <EventDatePicker
                            dateString={searchParams.date}
                            duration={params.duration}
                            month={searchParams.month}
                            userName={user?.name!}
                        />
                    </div> :
                    <div className="flex flex-col justify-center gap-10 items-center">
                        <p className="text-2xl font-bold">Oops!</p>
                        <p>
                            It seems you are trying to schedule an event in the <span className="text-red-500">past</span>
                        </p>
                    </div >
            }
        </>

    )
}