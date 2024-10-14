import { Request, Response } from "express"
import { storeEvent } from "../utils/DAO/Events/DaoEvents.ts"
import { EVENT_TYPE } from "../utils/EventTypes/EventType.utils.ts"
import axios from "axios"
import { storeMedicAvailability, updateMedicAvailability } from "../utils/DAO/Medics/DaoMedics.ts"

const EVENTS: any = []

export const eventHandler = async (req: Request, res: Response) => {
    const eventType = req.body.content.eventType
    console.log(eventType)
    console.log("BODY ", req.body)
    const event = req.body
    console.log(event)
    /*
    event = {
        uuid: string
        content: {
            eventType: string ,
            ...rest of the content
        }
    }
    */
    switch (eventType) {
        case "User Created":
            EVENTS.push(req.body)
            break;
        case "User Updated":
            console.log("Store updated user")
            EVENTS.push(req.body)
            await storeEvent(event)
            break;
        case "User Login":
            console.log("About to store User Login...")
            EVENTS.push(req.body)
            await storeEvent(event)
            break;
        case EVENT_TYPE.CREATE_APPOINTMENT:
            console.log('About to store appointment created...')
            EVENTS.push(req.body)
            console.log(event.content)
            await storeMedicAvailability(event.content.content.date, event.content.content.time, event.content.content.hp_uuid)
            await storeEvent(event)
            break;
        case EVENT_TYPE.RESCHEDULE_APPOINTMENT:
            console.log('About to reschedule appointment...')
            EVENTS.push(req.body)
            console.log(event.content)
            try{
                await updateMedicAvailability(event.content.content)
                await storeEvent(event)
            }catch(error:any){
                console.log("EVENT: ".concat(EVENT_TYPE.RESCHEDULE_APPOINTMENT))
                console.log(error.message)
                return res.status(500).json({
                    error: "EVENT: ".concat(EVENT_TYPE.RESCHEDULE_APPOINTMENT),
                    message: error.message
                })
            }
            break;
    }

    console.log(EVENTS)
    return res.status(200).json({
        message: "Event registered"
    })
}

export const createEvent = (event: string, content: any) => {
    console.log(content)
    let data
    switch (event) {
        case EVENT_TYPE.CREATE:
            data = {
                eventType: EVENT_TYPE.CREATE,
                content: {
                    uuid: content.uuid,
                    username: content.username,
                    password: content.password,
                    is_first_login: content.is_first_login,
                    role: content.role,
                    access: content.access,
                    deleted: content.deleted
                }
            }
            sendEvent(data)
            break;
        case EVENT_TYPE.UPDATE:
            data = {
                eventType: EVENT_TYPE.UPDATE,
                content: {
                    uuid: content.uuid,
                    password: content.password
                }
            }
            sendEvent(data)
            break;
        case EVENT_TYPE.DELETE:
            data = {
                eventType: EVENT_TYPE.DELETE,
                content: {
                    username: content.username
                }
            }
        case EVENT_TYPE.FIRST_LOGIN:
            data = {
                eventType: EVENT_TYPE.FIRST_LOGIN,
                content: {
                    uuid: content.uuid,
                    isFirstLogin: content.isFirstLogin
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