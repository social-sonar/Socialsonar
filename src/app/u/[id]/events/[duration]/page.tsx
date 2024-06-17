import EventDatePicker from "@/components/EventDatePicker"
import { getUserData } from "@/lib/data/events"
import { TimeDuration } from "@/lib/definitions"

type EventsProps = {
    params: {
        id: string,
        duration: string
    },
    searchParams: {
        month: string,
        tz: string
    }
}


const checkMonth = (month: string): boolean => {
    const dateFromMonth = new Date(month)
    const currentDate = new Date()
    const updatedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0)
    updatedDate.setUTCHours(0)
    return dateFromMonth >= updatedDate
}

const parseTimeInput = (input: string): TimeDuration => {
    const [, value, timeUnit] = input.match(/(\d+)([mh])/)!
    const duration = parseInt(value)
    return {
        duration,
        repr: timeUnit === 'm' ? `${value} minutes` : `${value} hour(s)`,
        timedelta: timeUnit === 'm' ? 1000 * 60 * duration : 1000 * 60 * 60 * duration
    }
}

export default async function EventScheduler({ params, searchParams }: EventsProps) {
    const isValidMonth = checkMonth(searchParams.month)
    if (isValidMonth) {
        const parsedDuration = parseTimeInput(params.duration)
        const userData = await getUserData(params.id, searchParams.month, parsedDuration, searchParams.tz)
        return <div className='flex flex-col justify-center gap-10'>
            <EventDatePicker
                tz={searchParams.tz}
                durationMetadata={parsedDuration}
                month={searchParams.month}
                userInfo={userData}
            />
        </div>
    }
    return <div className="flex flex-col justify-center gap-10 items-center">
        <p className="text-2xl font-bold">Oops!</p>
        <p>
            It seems you are trying to schedule an event in the <span className="text-red-500">past</span>
        </p>
    </div >
}