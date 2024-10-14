import { storeEventInDB, storeUserInDB, updateUserInDB, storeEvent, deleteUser, setFirstLogin } from "../utils/DAO/DAO.js";
import { EVENT_TYPE } from '../utils/EventTypes/EventTypes.utils.js'
import axios from "axios";

export const createEvent = async (data) => {
    console.log(data)
    switch (data.eventType) {
        case EVENT_TYPE.LOGIN:
            await postEvent(data)
            break;
        case EVENT_TYPE.LOGOUT:
            await postEvent(data)
            break;
        case EVENT_TYPE.TOKEN_REFRESH:
            await postEvent(data)
            break;
    }
}

const processEvent = async (data) => {
    console.log("Process: ", data)
    try {
        await Promise.all([
            storeEvent(data),
            postEvent(data)
        ])
        console.log("Successfully proccesed events")
    } catch (error) {
        console.log(error)
    }
}

export const postEvent = async (event) => {
    try {
        await axios({
            method: "POST",
            url: "http://localhost:3001/events",
            data: event
        })
    } catch (error) {
        console.log(error)
    }
}

/*export const storeEvent = async (event) => {
    await storeEventInDB(event)
}*/

export const eventHandler = async (req, res) => {
    console.log('Event Handler Access')
    console.log(req.body.content)
    const { eventType } = req.body.content
    console.log(eventType)
    const { username, password, uuid, role } = req.body.content
    const data = req.body
    console.log(data)
    //console.log(username, password, uuid)
    try {

        switch (eventType) {
            case EVENT_TYPE.CREATE:
                console.log('Received User Created Event')
                console.log(req.body.content)
                await storeUserInDB(data.content)
                await storeEvent(data)
                break;
            case EVENT_TYPE.UPDATE:
                console.log(data)
                console.log('Received User Updated Event')
                await updateUserInDB(data.content)
                await storeEvent(data)
                break;
            case EVENT_TYPE.LOGIN:
                console.log('Received Login Event')
                await storeEvent(data)
                break;
            case EVENT_TYPE.LOGOUT:
                console.log('Received Logout Event')
                await storeEvent(data)
                break;
            case EVENT_TYPE.DELETE:
                console.log('Received Deletion Event')
                await deleteUser(data.content)
                break;
            case EVENT_TYPE.FIRST_LOGIN:
                console.log('Received Event First Login')
                await setFirstLogin(data.content)
                await storeEvent(data)
                break;
        }
    } catch (error) {
        console.log(error)
    }
    return res.status(200).json({ message: "OK" })
}

