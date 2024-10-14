import axios from "axios";
import { Handler, Request, Response } from "express";
import { EVENT_TYPE } from "../utils/TYPES/EventTypes.utils";

export const eventHandler:Handler = (req:Request, res:Response) => {
    //console.log(req.body)
    return res.status(200).json({ message: "OK" })
}

export const createEvent = (event: string, content: any) => {
    console.log(content)
    let data
    switch (event) {
        case EVENT_TYPE.CREATE_APPOINTMENT:
            data = {
                eventType: EVENT_TYPE.CREATE_APPOINTMENT,
                content: {
                    appointment_uuid: content.appointment_uuid,
                    hp_uuid: content.hp_uuid,
                    date: content.date,
                    time: content.time
                }
            }
            sendEvent(data)
            break;
        case EVENT_TYPE.RESCHEDULE_APPOINTMENT:
            console.log('RESCHEDULE EVENT CONTENT:')
            console.log(content)
            data = {
                eventType: EVENT_TYPE.RESCHEDULE_APPOINTMENT,
                content: {
                    hp_uuid: content.hp_uuid,
                    new_date: content.new_date,
                    new_time: content.new_time,
                    old_date: content.old_date,
                    old_time: content.old_time
                }
            }
            sendEvent(data)
        break;
        case EVENT_TYPE.CANCEL_APPOINTMENT:
            console.log('CANCEL EVENT CONTENT:')
            console.log(content)
            data = {
                eventType: EVENT_TYPE.RESCHEDULE_APPOINTMENT,
                content: {
                    appointment_uuid: content.appointment_uuid,
                    hp_uuid: content.hp_uuid,
                    date: content.date,
                    time: content.time
                }
            }
            sendEvent(data)
        break;
    }
}

const sendEvent = (data: any) => {
    axios({
        method: "POST",
        url: "http://localhost:3001/events",
        data: data
    })
}