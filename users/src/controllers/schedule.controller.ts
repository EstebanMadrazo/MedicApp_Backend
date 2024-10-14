import { Availability, storeSchedule } from "../utils/DAO/Medics/DaoMedics"

type shift = {
    morning: string[],
    afternoon: string[]
}
interface Schedule {
    shift: shift,
    workDays: string[],
    limitTime: string,
    duration: string,
    price: number,
    is_videocall_allowed: boolean,
    is_rep_allowed: boolean
}

export type SchedulePreferences = {
    uuid: string,
    shift: shift,
    time_table: Object,
    limitTime: string,
    duration: string,
    price: number,
    is_videocall_allowed: boolean,
    is_rep_allowed: boolean
}
export const createSchedule = async (schedule: Schedule, uuid: string) => {
    try {
        const medicSchedule: SchedulePreferences = {
            uuid: uuid,
            shift: schedule.shift,
            duration: schedule.duration,
            limitTime: schedule.limitTime,
            price: schedule.price,
            time_table: createTimeTable(schedule.workDays, schedule.duration, schedule.shift),
            is_rep_allowed: schedule.is_rep_allowed,
            is_videocall_allowed: schedule.is_videocall_allowed,
        }
        console.log(medicSchedule);
        return medicSchedule
    } catch (error: any) {
        throw new Error(error.message)
    }
}
const createTimeTable = (workDays: string[], duration: string, shift: shift): { [key: string]: hourObject[] } => {
    const durationInMinutes = parseDuration(duration);

    try {

        const workingHours: { [key: string]: hourObject[] } = {};
        workDays.forEach(day => {
            console.log(day)
            workingHours[day] = generateWorkingHoursObject(shift, durationInMinutes);
        });
        return workingHours

    } catch (error: any) {
        throw new Error(error.message)
    }
}

const parseDuration = (duration: string): number => {
    // Suffix is hm, not used here but useful in Appointments Service
    let [dur, _suffix] = duration.split(' ')
    const [hours, minutes] = dur.split(':').map(Number);
    return (hours * 60) + minutes;
}
type hourObject = {
    hour: string,
    isAvailable: boolean
}
const generateWorkingHours = (shift: shift, durationInMinutes: number): string[] => {
    const morningStart = shift.morning ? shift.morning[0] : undefined;
    const morningEnd = shift.morning ? shift.morning[1] : undefined;
    const afternoonStart = shift.afternoon ? shift.afternoon[0] : undefined;
    const afternoonEnd = shift.afternoon ? shift.afternoon[1] : undefined;
    const workingHours: string[] = [];
    let currentTime: String | undefined
    if (shift.morning) {
        currentTime = morningStart;
        let i = 0
        while (currentTime != morningEnd) {
            const [endH, endM] = morningEnd!.split(':').map(Number)
            let [hours, minutes] = currentTime!.split(':').map(Number)
            if (hours === endH && minutes <= endM) break
            workingHours.push(currentTime as string)
            //Offset used to add hours
            const [offsetHours, _offsetMinutes] = `${((minutes + durationInMinutes) / 60)}`.split('.').map(Number)
            hours += offsetHours
            /*console.log('Offset Hours: ',offH)
            console.log('Offset Minutes: ',offM)
            console.log('Current Hours: ', hours)
            console.log('Current Minutes: ', minutes)
            console.log('Current Hours + Offset: ', (hours += offH))
            console.log('Current Minutes + Offset: ', (minutes))*/
            currentTime = `${hours}:${(minutes + durationInMinutes) % 60}`;

            if (currentTime.length < 5) {
                const [currentHours, currentMinutes] = currentTime.split(':')

                if (currentMinutes.length === 1) {
                    currentTime = `${currentTime}0`
                }
                if (currentHours.length === 1) {
                    currentTime = `0${currentTime}`
                }
            }
            i += 1
            // Terminates the loop in case of Infinite Loop
            if (i > 100) {
                throw new Error('Las horas no coinciden con la duración')
            }
        }
        workingHours.push(morningEnd as string)
    }

    if (shift.afternoon) {
        currentTime = afternoonStart;
        let i = 0
        while (currentTime != afternoonEnd) {
            const [endH, endM] = afternoonEnd!.split(':').map(Number)
            let [hours, minutes] = currentTime!.split(':').map(Number)
            if (hours === endH && minutes <= endM) break
            workingHours.push(currentTime as string)

            const [offH, offM] = `${((minutes + durationInMinutes) / 60)}`.split('.').map(Number)
            hours += offH

            currentTime = `${hours}:${(minutes + durationInMinutes) % 60}`;

            if (currentTime.length < 5) {

                const [cH, cM] = currentTime.split(':')

                if (cM.length === 1) {
                    currentTime = `${currentTime}0`
                }
                if (cH.length === 1) {
                    currentTime = `0${currentTime}`
                }
            }
            i += 1
            if (i > 100) {
                throw new Error('Las horas no coinciden con la duración')
            }
        }
        workingHours.push(afternoonEnd as string)
    }
    const removeDuplicates = [... new Set(workingHours)]
    return removeDuplicates;
}

const generateWorkingHoursObject = (shift: shift, durationInMinutes: number): hourObject[] => {
    const morningStart = shift.morning ? shift.morning[0] : undefined;
    const morningEnd = shift.morning ? shift.morning[1] : undefined;
    const afternoonStart = shift.afternoon ? shift.afternoon[0] : undefined;
    const afternoonEnd = shift.afternoon ? shift.afternoon[1] : undefined;
    const workingHours: hourObject[] = [];
    let currentTime: String | undefined
    if (shift.morning) {
        currentTime = morningStart;
        let i = 0
        while (currentTime != morningEnd) {
            const [endH, endM] = morningEnd!.split(':').map(Number)
            let [hours, minutes] = currentTime!.split(':').map(Number)
            if (hours === endH && minutes <= endM) break
            workingHours.push({ hour: currentTime as string, isAvailable: true })
            //Offset used to add hours
            const [offsetHours, _offsetMinutes] = `${((minutes + durationInMinutes) / 60)}`.split('.').map(Number)
            hours += offsetHours
            /*console.log('Offset Hours: ',offH)
            console.log('Offset Minutes: ',offM)
            console.log('Current Hours: ', hours)
            console.log('Current Minutes: ', minutes)
            console.log('Current Hours + Offset: ', (hours += offH))
            console.log('Current Minutes + Offset: ', (minutes))*/
            currentTime = `${hours}:${(minutes + durationInMinutes) % 60}`;

            if (currentTime.length < 5) {
                const [currentHours, currentMinutes] = currentTime.split(':')

                if (currentMinutes.length === 1) {
                    currentTime = `${currentTime}0`
                }
                if (currentHours.length === 1) {
                    currentTime = `0${currentTime}`
                }
            }
            i += 1
            // Terminates the loop in case of Infinite Loop
            if (i > 100) {
                throw new Error('Las horas no coinciden con la duración')
            }
        }
        workingHours.push({ hour: morningEnd as string, isAvailable: true })
    }

    if (shift.afternoon) {
        currentTime = afternoonStart;
        let i = 0
        while (currentTime != afternoonEnd) {
            const [endH, endM] = afternoonEnd!.split(':').map(Number)
            let [hours, minutes] = currentTime!.split(':').map(Number)
            if (hours === endH && minutes <= endM) break
            workingHours.push({ hour: currentTime as string, isAvailable: true })

            const [offH, offM] = `${((minutes + durationInMinutes) / 60)}`.split('.').map(Number)
            hours += offH

            currentTime = `${hours}:${(minutes + durationInMinutes) % 60}`;

            if (currentTime.length < 5) {

                const [cH, cM] = currentTime.split(':')

                if (cM.length === 1) {
                    currentTime = `${currentTime}0`
                }
                if (cH.length === 1) {
                    currentTime = `0${currentTime}`
                }
            }
            i += 1
            if (i > 100) {
                throw new Error('Las horas no coinciden con la duración')
            }
        }
        workingHours.push({ hour: afternoonEnd as string, isAvailable: true })
    }
    const removeDuplicates = [... new Set(workingHours)]
    return removeDuplicates;
}

type timeTable = {
    Lunes?: hour[],
    Martes?: hour[],
    Miércoles?: hour[],
    Jueves?: hour[],
    Viernes?: hour[],
    Sábado?: hour[],
    Domingo?: hour[]
}
type hour = {
    hour:string,
    isAvailable:boolean
}
export const checkAvailability = (schedule: timeTable, availability: Availability[] | null, date: string) => {
    //console.log(schedule.Lunes)
    const availabilityDate = new Date(date)
    availabilityDate.setUTCMinutes(availabilityDate.getUTCMinutes() + availabilityDate.getTimezoneOffset())
    console.log(availabilityDate.toDateString())
    const day = availabilityDate.toDateString().split(' ')[0]
    console.log(day)
    let toMxDay:string
    switch (day) {
        case "Mon":
            toMxDay = 'Lunes'
            break;
        case "Tue":
            toMxDay = 'Martes'
            break;
        case "Wed":
            toMxDay = 'Miércoles'
            break;
        case "Thu":
            toMxDay = 'Jueves'
            break;
        case "Fri":
            toMxDay = 'Viernes'
            break;
        case "Sat":
            toMxDay = 'Sábado'
            break;
        case "Sun":
            toMxDay = 'Domingo'
            break;
    }
    Object.entries(schedule).forEach(([day, items]) => {
        console.log("Iterating over: ", day)
        items.forEach(item => {
            if((day === toMxDay)){
                availability?.forEach(element =>{
                    if(item.hour === element.time){
                        item.isAvailable = false
                    }
                })
            }
        })
    })
    const uniqueSchedule:any = {};
    for (const day in schedule) {
        //@ts-ignore
        uniqueSchedule[day] = schedule[day].filter((obj:any, index:any, self:any) =>
           index === self.findIndex((t:any) => (
             t.hour === obj.hour
           ))
        );
       }
    return uniqueSchedule
}