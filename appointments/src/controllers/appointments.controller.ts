import { Handler, Request, Response } from "express"
import axios, { AxiosResponse } from "axios"
import { Appointment, AppointmentDB } from "../models/appointment.model.ts"
import { EVENT_TYPE } from "../utils/TYPES/EventTypes.utils.ts"
import { createUUID, createVerificationCode } from "../utils/Encryption/encryption.utils.ts"
import { deleteAppointmentsFromMedic, getAppointment, getAppointmentByUserUUID, getAppointmentsReport, getAppointmentRequest, storeAppointmentInDB, storeAppointmentRequest, updateAppointment, updateAppointmentCancel, getAppointmentDetails, getAppointmentByDate, getAppointmentByMonth, storeAppointmentComment } from "../utils/DAO/dao.utils.ts"
import { AppointmentRequest } from "../models/appointmentRquest.model.ts"
import { createEvent } from "./event.controller.ts"

export const handleAppointment: Handler = async (req: Request, res: Response) => {
    const data = req.body
    console.log(data)
    console.log(req.headers)
    const token = req.headers['authorization']
    const refresher = req.headers['refresher']
    if (isEmpty(data)) {
        return res.status(400).json({
            error: "Appointment Creation",
            message: "No appointment data found in request body"
        })
    }
    const userInfo = await getUserInfo(token as string, refresher as string)
    try {
        data.appointmentUUID ? null : data.appointmentUUID = createUUID()
        const app = new Appointment()
        app.createAppointment(data)
        app.setPatientUUID(userInfo?.data[0].uuid)
        app.setConfirmationCode(createVerificationCode())
        console.log(app)
        await storeAppointmentInDB(app)
        createEvent(EVENT_TYPE.CREATE_APPOINTMENT, {
            appointment_uuid: app.getAppointmentUUID(),
            hp_uuid: app.gethealthProfUUID(),
            date: app.getAppointmentDate().split(' ')[0],
            time: app.getAppointmentDate().split(' ')[1].substring(0, 5)
        })
        return res.status(201).json({
            message: "Appointment Created",
            appointment: app.getAppointmentUUID(),
            date: app.getAppointmentDate().split(' ')[0],
            time: app.getAppointmentDate().split(' ')[1].substring(0, 5)
        })
    } catch (error: any) {
        console.log(error)
        return res.status(400).json({
            error: "Appointment Creation",
            message: error.message
        })
    }
}

const isEmpty = (obj: Record<string, any>) => {
    return Object.keys(obj).length === 0
}
/*
UUID
CurrentDate
New Date
*/
export const handleAppointmentReschedule: Handler = async (req: Request, res: Response) => {
    const data = req.body
    console.log(data)
    if (!data) {
        return res.status(400).json({
            error: "Appointment Reschedule",
            message: "No appointment data for rescheduling found in body"
        })
    }
    console.log(data)
    console.log(process.env.SCHEDULE_ENDPOINT)
    try {
        const resultSchedule = await axios({
            method: "POST",
            url: `http://${process.env.USER_INFO_IP}/v1/user/medicSchedule`,
            headers: {
                Authorization: req.headers['authorization'],
                Refresher: req.headers['refresher'],
            },
            data: {
                "hp_uuid": data.hp_uuid
            }
        })
        //console.log('Result Schedule: ', resultSchedule.data)
        try{
             /**
         * Get the date now
         */
        const nowDate: Date = new Date()
        console.log('Time Zone Offset ', nowDate.getTimezoneOffset())
        nowDate.setUTCMinutes(nowDate.getUTCMinutes() - nowDate.getTimezoneOffset())
        console.log("NOW DATE: ", nowDate)

        /**
         * Split the time limit part to know if should add h=hours, m=minutes or hm= hours and minutes to the date now
         */
        const limitTimeParts: string[] = resultSchedule.data.limitTime.split(' ')
        let hour: number = 0
        let minutes: number = 0
        let hoursAndMinutes: string[] = []
        if (limitTimeParts[1] === 'hm') {
            hoursAndMinutes = limitTimeParts[0].split(':')
            console.log('Hours and Minutes: ',hoursAndMinutes)
            hour = Number(hoursAndMinutes[0])
            minutes = Number(hoursAndMinutes[1])
        }

        console.log('Limit Time Parts: ', limitTimeParts)
        const timePart: number = Number(limitTimeParts[0])
        console.log('Time Part: ', timePart)

        switch (limitTimeParts[1]) {
            case "h":
                nowDate.setUTCHours(nowDate.getUTCHours() + timePart)
                console.log("UTC ADDED TIME: ", nowDate)
                console.log("Horas")
                break;
            case "m":
                nowDate.setUTCMinutes(nowDate.getUTCMinutes() + timePart)
                console.log('UTC ADDED MINUTES: ', nowDate)
                console.log("Minutos")
                break;
            case "hm":
                nowDate.setUTCHours(nowDate.getUTCHours() + hour)
                nowDate.setUTCMinutes(nowDate.getUTCMinutes() + minutes)
                console.log('UTC + hours and minutes: ', nowDate)
                console.log("Horas y Minutos")
                break;
        }
        const newAppDate = new Date(data.appointmentDate)
        console.log('NEW APP DATE: ', newAppDate)
        newAppDate.setUTCMinutes(newAppDate.getUTCMinutes() - newAppDate.getTimezoneOffset())
        if (newAppDate < nowDate) {
            return res.status(500).json({
                error: 500,
                message: "Can't reschedule for a past date"
            })
        }
        /**
         * Retrieve appointment from db using the appointment uuid
         */
        const resultAppointment: AppointmentDB | undefined = await getAppointment(data.appointmentUUID)
        console.log('Result Appointment: ', resultAppointment)
        const old_date = resultAppointment?.date.split(' ')[0]
        const old_time = resultAppointment?.date.split(' ')[1].substring(0, 5)
        console.log('OLD DATE: ', old_date, ' ', old_time)
        /*
         *  Parse the appointment date from yyyy-MM-dd HH:mm:ss to yyyy-MM-ddTHH:mm:ss.000Z  
        */
        console.log('APP Date ', resultAppointment?.date)


        const app = new Appointment()
        app.parseAppointment(resultAppointment as AppointmentDB)
        const status = app.rescheduleDate(data.appointmentDate, nowDate.toISOString())
        console.log('Status: ',status)
        if (status !== "Success") {
            throw new Error(status)
        }
        await updateAppointment(app)

        createEvent(EVENT_TYPE.RESCHEDULE_APPOINTMENT, {
            hp_uuid: app.gethealthProfUUID(),
            new_date: app.getAppointmentDate().split(' ')[0],
            new_time: app.getAppointmentDate().split(' ')[1].substring(0, 5),
            old_date: old_date,
            old_time: old_time
        })
        return res.status(200).json(status)
        }catch(error:any){
            return res.status(500).json({
                error: "Reschedule Appointment",
                message: error.message
            })
        }
    } catch (error: any) {
        console.log(error.message)
        return res.status(400).json(error.response.data)
    }
}

/**
 * appointment_uuid
 * new_date 
 */

export const handleAppointmentRequest: Handler = async (req: Request, res: Response) => {
    /**
     * If request_uuid exists in body it is an already created request, if not is a new request
     * Schedule Request, DB Table Request, store requests, sends it to the client
     */

    const { appointmentUUID, newDate, requestUUID } = req.body
    if (!requestUUID) {
        //create new request
        console.log("Create new request")
        try {
            const date: Date = new Date(newDate)
            console.log(date.toISOString())
            const result: AppointmentDB = await getAppointment(appointmentUUID)
            const app = new Appointment()
            app.parseAppointment(result)
            console.log(app)
            const patientUUID = app.getPatientUUID()
            /**
             * With patientUUID send a notification for the request
             */

            const request = new AppointmentRequest()
            request.setAppointmentUUID(app.getAppointmentUUID())
            request.setNewDate(newDate)
            request.createRequest(request)
            console.log(request)
            await storeAppointmentRequest(request)


            /**
             * create notification
             */


            return res.status(201).json(app)

        } catch (error: any) {
            console.log(error)
            return res.status(400).json({ error: "Appointment Reschedule Request" })
        }
    }

    //@ts-ignore
    const request: AppointmentRequest[] | undefined = await getAppointmentRequest(requestUUID)
    console.log(request?.[0])
    const appReq = new AppointmentRequest()
    appReq.parseRequest(request?.[0] as AppointmentRequest)
    if (appReq.getIsApproved() == true) {
        const result: AppointmentDB | undefined = await getAppointment(appReq.getAppointmentUUID())
        const app = new Appointment()
        app.parseAppointment(result as AppointmentDB)
        app.rescheduleDate(appReq.getNewDate(), new Date().toISOString())
        try {
            await updateAppointment(app)
            return res.status(200).json({ message: "Successfully rescheduled appointment" })
        } catch (error: any) {
            console.log(error)
            return res.status(400).json({ message: "Failed to reschedule appointment" })
        }
    }
    return res.status(200).json(request?.[0])
}

export const handleAppointmentCancel: Handler = async (req: Request, res: Response) => {
    const { appointmentUUID } = req.body
    if (!appointmentUUID) {
        return res.status(400).json({
            error: "Appointment Cancel",
            message: "No appointment uuid provided"
        })
    }
    const result: AppointmentDB | undefined = await getAppointment(appointmentUUID)
    const app = new Appointment()
    app.parseAppointment(result as AppointmentDB)

    if (app.getIsCancelled() == true) {
        return res.status(500).json({ error: "Appointment Cancel", message: "Appointment has already been cancelled" })
    }
    app.setIsCancelled(true)
    const status = await updateAppointmentCancel(app)
    if (status === 'Success') {
        // create event to notify payments about cancellation for reimbursement

        createEvent(EVENT_TYPE.CANCEL_APPOINTMENT, {
            appointment_uuid: app.getAppointmentUUID(),
            hp_uuid: app.gethealthProfUUID(),
            date: app.getAppointmentDate().split(' ')[0],
            time: app.getAppointmentDate().split(' ')[1].substring(0, 5)
        })

        return res.status(200).json({
            message: "Appointment has been cancelled successfully"
        })
    }

    return res.status(500).json({
        error: "Appointment Cancel",
        message: "Unexpected error trying to cancelled appointment"
    })
}

export const handleAppointmentInfo = async (req: Request, res: Response) => {
    const { uuid, role } = req.query
    console.log(uuid, role)
    if (!uuid || !role) {
        return res.status(400).json({
            error: "Appointment Info",
            message: "UUID or Role not found"
        })
    }
    try {
        const appointments = await getAppointmentByUserUUID(uuid as string) as Array<any>
        console.log(appointments)
        let appointmentsInfo: Array<any> = []


        appointments?.forEach(async (element, index) => {
            try {
                const info = await axios({
                    url: `http://localhost:3000/user/user`,
                    method: "GET",
                    params: {
                        userUUID: role === 'Medic' ? element.user_uuid : element.health_professional_uuid
                    }
                })
                appointmentsInfo.push({ appointment: appointments[index], info: info.data[0] })
            } catch (error: any) {
                console.log(error.message)
            }
        });
        const user = await axios({
            url: 'http://localhost:3000/user/user',
            method: "GET",
            params: {
                userUUID: uuid
            }
        })
        const userInfo = user.data[0]
        const data = { appointmentsInfo, userInfo }
        return res.status(200).json(data)
    } catch (error: any) {
        console.log(error)
        return res.status(500).json(error)
    }

}

const getUserInfo = async (token: string, refresher: string) => {
    console.log(token)
    console.log(refresher)
    try {
        const result = await axios({
            url: 'http://localhost:3000/user/userInfo',
            method: "POST",
            headers: {
                Authorization: token,
                Refresher: refresher
            }
        })
        return result
    } catch (error: any) {
        console.log(error)
    }
}

export const handleAppointmentDeletion: Handler = async (req: Request, res: Response) => {
    const { uuid } = req.body
    if (!uuid || uuid.length === 0) {
        return res.status(400).json({
            error: "Appointment Deletion",
            message: "No Medic UUID provided"
        })
    }
    try {
        await deleteAppointmentsFromMedic(uuid)
        return res.status(200).json({
            message: "Successfully deleted appointments"
        })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
}

export const handleAppointmentReport: Handler = async (req: Request, res: Response) => {
    const { uuid, date } = req.query
    console.log(uuid, date)
    if (!uuid || !date) {
        return res.status(400).json({
            error: "Appointment Report",
            message: "UUID or Date not specified"
        })
    }
    try {
        const appointments = await getAppointmentsReport(uuid as string, date as string)
        return res.status(200).json(appointments)
    } catch (error: any) {
        return res.status(500).json({
            error: "Appointments Report",
            message: error.message
        })
    }
}

export const handleAppointmentDetails: Handler = async (req: Request, res: Response) => {
    console.log(req.query)
    const { date, time, uuid } = req.query
    if (!date || !time) {
        return res.status(400).json({
            error: 'Appointment Details',
            message: "No datetime specified"
        })
    }
    if (!uuid) {
        return res.status(400).json({
            error: 'Appointment Details',
            message: "No UUID specified"
        })
    }

    try {
        const appDetails = await getAppointmentDetails(date as string, time as string, uuid as string)
        if (appDetails.length === 0) {
            throw new Error('No hay cita para esta fecha')
        }
        const userDetails = await axios({
            method: "GET",
            url: "http://localhost:3000/user/user",
            params: {
                userUUID: appDetails[0].user_uuid
            }
        })
        const hp_Details = await axios({
            method: "GET",
            url: "http://localhost:3000/user/user",
            params: {
                userUUID: appDetails[0].health_professional_uuid
            }
        })
        const details = {
            appointment: appDetails[0],
            pacient: userDetails.data[0],
            health_professional: hp_Details.data[0]
        }
        return res.status(200).json(details)
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({
            error: 'Appointment Details',
            message: error.message
        })
    }
}

export const handleFilterAppointments: Handler = async (req: Request, res: Response) => {
    const { date, month, uuid, role } = req.query
    const { payload } = req.body
    if (!date && !month) {
        return res.status(400).json({
            error: "Filter Appointments",
            message: 'Especifica una fecha o un mes',
            formats: "Fecha: yyyy-MM-dd,  Mes: yyyy-MM"
        })
    }
    if (!role) {
        return res.status(400).json({
            error: "Filter Appointments",
            message: 'Especifica el rol del usuario'
        })
    }
    try {
        let appointmentsInfo: Array<any> = []
        if (date) {
            const appointments = await getAppointmentByDate(date as string, uuid as string)
            appointments?.forEach(async (element, index) => {
                try {
                    const info = await axios({
                        url: 'http://localhost:3000/user/user',
                        method: "GET",
                        params: {
                            userUUID: role === 'Medic' ? element.user_uuid : element.health_professional_uuid
                        }
                    })
                    appointmentsInfo.push({ appointment: appointments[index], info: info.data[0] })
                } catch (error: any) {
                    console.log(error.message)
                }
            });
            const user = await axios({
                url: 'http://localhost:3000/user/user',
                method: "GET",
                params: {
                    userUUID: uuid
                }
            })
            const userInfo = user.data[0]
            const data = { appointmentsInfo, userInfo }
            return res.status(200).json(data)
        }
        if (month && !date) {
            const appointments = await getAppointmentByMonth(month as string, uuid as string)
            appointments?.forEach(async (element, index) => {
                try {
                    const info = await axios({
                        url: 'http://localhost:3000/user/user',
                        method: "GET",
                        params: {
                            userUUID: role === 'Medic' ? element.user_uuid : element.health_professional_uuid
                        }
                    })
                    appointmentsInfo.push({ appointment: appointments[index], info: info.data[0] })
                } catch (error: any) {
                    console.log(error.message)
                }
            });
            const user = await axios({
                url: 'http://localhost:3000/user/user',
                method: "GET",
                params: {
                    userUUID: uuid
                }
            })
            const userInfo = user.data[0]
            const data = { appointmentsInfo, userInfo }
            return res.status(200).json(data)
        }
    } catch (error: any) {
        console.log(error.message)
        return res.status(400).json({
            error: "Filter Appointments",
            message: error.message
        })
    }
}

export const handleAppointmentComment: Handler = async (req: Request, res: Response) => {
    const { comment, appointment_uuid } = req.body
    if (!comment) {
        return res.status(400).json({
            error: "Appointment Comment",
            message: 'No comment object found'
        })
    }

    try {
        await storeAppointmentComment(comment, appointment_uuid as string)
        return res.status(201).json({
            message: `Successfully stored comment in appointment ${appointment_uuid}`
        })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({   
            error: "Appointment Comment",
            message: error.message
        })
    }
}