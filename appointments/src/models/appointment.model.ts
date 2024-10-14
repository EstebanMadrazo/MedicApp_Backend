import { createUUID } from "../utils/Encryption/encryption.utils"

export interface AppointmentRequest {
    appointmentUUID: string
    patientUUID: string
    healthProfUUID: string
    currentDate: string
    appointmentDate: string
    total: number
    isPrioritary: boolean
}

export interface AppointmentDB {
    uuid: string
    user_uuid: string
    health_professional_uuid: string
    total: number
    date: string
    is_cancelled: boolean
    is_prioritary: boolean
    is_verified: boolean
    confirmation_code: string
    exit_questionnaire: object
}

export class Appointment {
    private appointmentUUID!: string
    private patientUUID!: string
    private healthProfUUID!: string
    private appointmentDate!: string
    private total!: number
    private isCancelled!: boolean
    private isPrioritary!: boolean
    private confirmationCode!: string
    private isVerified!: boolean
    private exitQuestionnaire!: object

    /**
     * Creates Appointment.
     * @param data An object that contains one or more properties that specify Appointment fields.
    */
    createAppointment(data: AppointmentRequest): void {
        this.appointmentUUID = data.appointmentUUID
        this.patientUUID = data.patientUUID
        this.healthProfUUID = data.healthProfUUID
        this.appointmentDate = this.validateDate(data.appointmentDate)
        this.total = data.total as number
        //this.isCancelled = data.isCancelled
        this.isPrioritary = data.isPrioritary
        //this.confirmationCode = data.confirmationCode
        //this.isVerified! = data.isVerified
        this.exitQuestionnaire = {}
    }

    parseAppointment(data: AppointmentDB): void {
        this.appointmentUUID = data.uuid
        this.patientUUID = data.user_uuid
        this.healthProfUUID = data.health_professional_uuid
        this.appointmentDate = this.validateDate(data.date)
        this.total = data.total
        this.isCancelled = data.is_cancelled
        this.isPrioritary = data.is_prioritary
        this.confirmationCode = data.confirmation_code
        this.isVerified! = data.is_verified
        this.exitQuestionnaire = data.exit_questionnaire
    }

    getAppointmentUUID(): string {
        return this.appointmentUUID
    }
    setAppointmentUUID(uuid: string): void {
        this.appointmentUUID = uuid
    }
    getPatientUUID(): string {
        return this.patientUUID
    }
    setPatientUUID(uuid: string): void {
        this.patientUUID = uuid
    }
    gethealthProfUUID(): string {
        return this.healthProfUUID
    }
    sethealthProfUUID(uuid: string): void {
        this.healthProfUUID = uuid
    }
    getAppointmentDate(): string {
        return this.appointmentDate
    }
    setAppointmentDate(date: string): void {
        this.appointmentDate = date
    }
    getTotal(): number {
        return this.total
    }
    setTotal(total: number): void {
        this.total = total
    }
    getIsCancelled(): boolean {
        return this.isCancelled
    }
    setIsCancelled(state: boolean): void {
        this.isCancelled = state
    }
    getIsPrioritary(): boolean {
        return this.isPrioritary
    }
    setIsPrioritary(state: boolean): void {
        this.isPrioritary = state
    }
    getConfirmationCode(): string {
        return this.confirmationCode
    }
    setConfirmationCode(code: string): void {
        this.confirmationCode = code
    }
    getIsVerified(): boolean {
        return this.isVerified
    }
    setIsVerified(state: boolean): void {
        this.isVerified = state
    }
    getExitQuestionnaire(): object {
        return this.exitQuestionnaire
    }
    setExitQuestionnaire(questionnaire: object): void {
        this.exitQuestionnaire = questionnaire
    }

    /**
     * 
     * @param date Date that wants to reschedule
     * @param timelimit Minimun time that a patient can reschedule, defined by each medic
     */
    rescheduleDate(dateToReschedule: string, now: string): string {
        /*
            Make call to retrieve the schedule preferences of the medic
            then compare the date.now() with the time left for rescheduling
            If its date.now + time < appointement.date reschedule
            If not throw error
        */
        //this.setAppointmentDate(date)

        console.log("Schedule from reschedule ", this.appointmentDate)
        const appDate = new Date(this.appointmentDate)
        appDate.setUTCMinutes(appDate.getUTCMinutes() - appDate.getTimezoneOffset())
        console.log("App Date: ", appDate)
        console.log('Now: ', now)
        const nowDate = new Date(now)
        console.log(nowDate)
        if (nowDate < appDate) {
            console.log('Reschedule')
            console.log('Reschedule for ', dateToReschedule)
            const date = this.validateDate(dateToReschedule)
            this.appointmentDate = date
            return "Success"
        } else {
            console.log("Can't reschedule, timelimit already reached")
            return("Can't reschedule, time limit already reached")
        }
        //return "Failed"
    }

    validateDate(date: string) {
        console.log(date)
        try {
            const validDate = new Date(date + '.000Z').toISOString().split('T')
            console.log('Valid Date const', validDate)
            const timePart = validDate[1].split('.')
            if (validDate.toString() === "Invalid Date") {
                throw new Error("Date Format")
            }
            return validDate[0] + " " + timePart[0]
        } catch (error: any) {
            console.log(error)
            throw new Error(error)
        }
    }

}