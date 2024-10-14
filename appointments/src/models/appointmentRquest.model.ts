import { createUUID } from "../utils/Encryption/encryption.utils.ts"

export class AppointmentRequest {
    private id!: number
    private request_uuid!:string
    private appointment_uuid!: string
    private new_date!: string
    private is_approved!: boolean

    createRequest(ar: AppointmentRequest): void{
        this.request_uuid = createUUID()
        this.appointment_uuid = ar.appointment_uuid
        this.new_date = ar.new_date
        this.is_approved = false
    }

    parseRequest (ar: AppointmentRequest): void{
        this.id = ar.id
        this.request_uuid = ar.request_uuid
        this.appointment_uuid = ar.appointment_uuid
        this.new_date = ar.new_date
        this.is_approved = ar.is_approved
    }

    sendRequestToUser(){

    }
    
    getRequestUUID() {
        return this.request_uuid
    }
    setRequestUUID(uuid: string) {
        this.request_uuid = uuid
    }
    getAppointmentUUID() {
        return this.appointment_uuid
    }
    setAppointmentUUID(uuid: string) {
        this.appointment_uuid = uuid
    }
    getNewDate() {
        return this.new_date
    }
    setNewDate(date: string){
        this.new_date = date
    }
    getIsApproved() {
       return this.is_approved
    }
    setIsApproved(approved: boolean) {
       this.is_approved = approved
    }
    getID() {
        return this.id
    }
    setID(id:number) {
        this.id = id
    }
}