import { Handler, Request, Response } from "express";
import {
    storeMedicInDB,
    getMedicsBySpeciality,
    getMedicsBy_Speciality_State_Keyword,
    getMedicsByState,
    getMedicsBy_Speciality_State,
    getMedicsBy_State_Keyword,
    getMedicsByKeyword,
    getMedicsBy_Speciality_Keyword,
    getMedicByUUID,
    getAllSpecialities,
    getMedicInformation,
    getMedicSchedule,
    storeSchedule,
    storeMedicAvailability,
    getMedicAvailability,
    getMedicAppointments,
    freeMedicAvailability,
    getMedicInformationByUUID
} from "../utils/DAO/Medics/DaoMedics";
import { Medic } from "../models/MedicModel/Medic";
import { stringBuilder } from "../utils/StringConstructor/stringconstructor.utils";
import { getUserByAccount, getUserByUUID } from "../utils/DAO/Users/DaoUsers";
import { checkAvailability, createSchedule } from "./schedule.controller";
import axios from "axios";
import { createEvent } from "./event.controller";
import { EVENT_TYPE } from "../utils/EventTypes/EventType.utils";

export const registerMedicHandler: Handler = async (req: Request, res: Response) => {
    const data = req.body
    console.log(data)
    try {
        const medic = new Medic()
        medic.createMedic(data)
        await storeMedicInDB(medic)

        return res.status(201).json({
            message: "Medic Created",
            uuid: medic.getUUID()
        })
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({
            error: "Medic Creation",
            message: error.message
        })
    }
}

export const filterHandler: Handler = async (req: Request, res: Response) => {
    console.log(req.body)
    //const {specialities, states, uuid} = req.body
    const uuid = req.body.uuid === undefined ? "" : req.body.uuid
    const keyword = req.body.keyword === undefined ? "" : req.body.keyword
    const states = req.body.states === undefined ? "" : req.body.states
    const specialities = req.body.specialities === undefined ? "" : req.body.specialities
    console.log("State", states?.length)
    console.log("Keyword", keyword?.length)
    console.log("Specialities", specialities?.length)
    console.log("UUID", uuid)

    //filter by state, specs and keyword
    if (uuid?.length) {
        console.log(uuid)
        const result = await getMedicByUUID(uuid)
        return res.status(200).json(result)
    }
    if (states?.length !== 0 && keyword?.length !== 0 && specialities?.length !== 0) {
        //const specsBuilder = stringBuilder(specialities)
        const stateBuilder = stringBuilder(states)
        const result = await getMedicsBy_Speciality_State_Keyword(specialities, stateBuilder, keyword)
        console.log(result)
        console.log('states, specs and keyword')
        return res.status(200).json(result)
    }
    //filter by specs and keyword
    if (specialities?.length !== 0 && keyword?.length !== 0) {
        console.log('specs and keyword')
        //const specsBuilder = stringBuilder(specialities)
        const result = await getMedicsBy_Speciality_Keyword(specialities, keyword)
        return res.status(200).json(result)
    }
    //filter by state and specs
    if (states?.length !== 0 && specialities?.length !== 0) {
        //const specsBuilder = stringBuilder(specialities)
        const stateBuilder = stringBuilder(states)
        const result = await getMedicsBy_Speciality_State(specialities, stateBuilder)
        console.log('specs and states')
        return res.status(200).json(result)
    }
    //filter by state and keyword
    if (states?.length !== 0 && keyword?.length !== 0) {
        const stateBuilder = stringBuilder(states)
        const result = await getMedicsBy_State_Keyword(stateBuilder, keyword)
        console.log('state and keyword')
        return res.status(200).json(result)
    }
    //filter by specs
    if (specialities?.length !== 0) {
        console.log('specs')
        //const specsBuilder = stringBuilder(specialities)
        const result = await getMedicsBySpeciality(specialities)
        return res.status(200).json(result)
    }
    //filer by keyword
    if (keyword?.length !== 0 && keyword !== undefined) {
        console.log('keyword')
        const result = await getMedicsByKeyword(keyword)
        return res.status(200).json(result)
    }
    //filter by state
    if (states?.length !== 0) {
        const stateBuilder = stringBuilder(states)
        const result = await getMedicsByState(stateBuilder)
        console.log('state')
        return res.status(200).json(result)
    }
    return res.status(500).json({
        error: "Filter Error",
        message: "Specialities, States and Keyword could not be founded, please provide at least one"
    })
}

export const scheduleHandler: Handler = async (req: Request, res: Response) => {
    const { hp_uuid } = req.body
    console.log(hp_uuid)
    if (!hp_uuid) {
        return res.status(400).json({
            error: "Medic Schedule Preferences",
            message: "UUID not provided for Medic"
        })
    }
    try {
        const result = await getMedicSchedule(hp_uuid)
        console.log(result)
        //@ts-ignore
        if (result.length === 0) {
            console.log("Not found")
            throw new Error("The Medic does not have a schedule set in the current db context")
        }
        //@ts-ignore
        return res.status(200).json(result)
    } catch (error: any) {
        console.log(error)
        return res.status(400).json({
            error: "Medic Schedule",
            message: error.message
        })
    }
}

export const discoverMedicsHandler: Handler = async (req: Request, res: Response) => {
    const { uuid } = req.query
    if (!uuid || uuid.length === 0) {
        return res.status(400).json({
            error: "Discovery Medics",
            message: "No UUID provided"
        })
    }
    const user = await getUserByUUID(uuid as string)
    console.log(user)
    const state = [user.state]
    console.log(state)
    const stateBuilder = stringBuilder(state)
    console.log(stateBuilder)
    const medics = await getMedicsByState(stateBuilder)
    console.log(medics)
    return res.status(200).json(medics)
}

export const discoverSpecialitiesHandler: Handler = async (req: Request, res: Response) => {
    const result = await getAllSpecialities()
    console.log(result)
    // @ts-ignore
    const arrayTest: string[] = result?.flat(Infinity)
    console.log(arrayTest)
    const removeDuplicates = (array: string[]) => {
        return array.filter((item: string, index: number) => array.indexOf(item) === index)
    }
    const filteredArray = removeDuplicates(arrayTest)
    const elementToMove = "Urgencias"
    const index = filteredArray.indexOf(elementToMove)
    if (index !== -1) {
        filteredArray.splice(index, 1)
        filteredArray.unshift(elementToMove)
    }
    return res.status(200).json(filteredArray)
}

export const handleMedicInformation = async (account: string) => {
    try {
        const result = await getMedicInformation(account)
        return result
    } catch (error: any) {
        console.log(error.message)
        console.log("Error in Medic Information function on Medic Controller")
    }
}

export const createScheduleHandler: Handler = async (req: Request, res: Response) => {
    const { uuid, schedule } = req.body
    console.log('Create Schedule ', req.body)
    if (!uuid) {
        return res.status(400).json({
            error: "Create Medic Schedule",
            message: "UUID not provided"
        })
    }
    if (!schedule) {
        return res.status(400).json({
            error: "Create Medic Schedule",
            message: "Schedule not provided"
        })
    }
    try {
        console.log('Creating Schedule...')
        const workingHours = await createSchedule(schedule, uuid)
        console.log('Storing Schedule....')
        await storeSchedule(workingHours)
        const user = await getUserByUUID(uuid)
        console.log('Creating Event...')
        createEvent(
            EVENT_TYPE.FIRST_LOGIN,
            {
                uuid: user.uuid,
                isFirstLogin: true
            })
        return res.status(201).json(workingHours)
    } catch (error: any) {
        return res.status(500).json({
            error: 'Medic Schedule',
            message: error.message
        })
    }
}
/**
 * 
 * @param payload The user account retrieved from the token with the middleware 
 * @param date Date of the appointment to block EX: 2024-04-15
 * @param time Time for the date of the appointment to block 16:00
 * @returns 
 */
export const availabilityHandler: Handler = async (req: Request, res: Response) => {
    const { payload, date, time } = req.body
    console.log(payload, date, time)
    if (req.method === 'POST') {
        if (!payload || !date || !time) {
            return res.status(400).json({
                error: "Medic Availability",
                message: "Missing payload, date or time"
            })
        }
        try {
            const user = await getUserByAccount(payload)
            //@ts-ignore
            const { uuid } = user[0]
            await storeMedicAvailability(date, time, uuid)
            return res.status(201).json({
                message: "Successfully blocked date and time"
            })
        } catch (error: any) {
            return res.status(500).json({
                error: "Medic Availability",
                message: error.message
            })
        }
    }
    if (req.method === 'DELETE') {
        if (!payload || !date || !time) {
            return res.status(400).json({
                error: "Medic Availability",
                message: "Missing payload, date or time"
            })
        }
        try {
            const user = await getUserByAccount(payload)
            //@ts-ignore
            const { uuid } = user[0]
            await freeMedicAvailability(date, time, uuid)
            return res.status(201).json({
                message: "Successfully freed date and time"
            })
        } catch (error: any) {
            return res.status(500).json({
                error: "Medic Availability",
                message: error.message
            })
        }
    }
    if (req.method === 'GET') {
        if (!payload) {
            return res.status(400).json({
                error: "Medic Availability",
                message: "Missing payload"
            })
        }
        try {
            const user = await getUserByAccount(payload)
            //@ts-ignore
            const uuid = user[0].uuid
            const availability = await getMedicAvailability(uuid)
            return res.status(200).json(availability)
        } catch (error: any) {
            console.log(error)
            throw new error(error.message)
        }
    }
}
export const medicAvailabilityHandler: Handler = async (req: Request, res: Response) => {
    const { uuid, date } = req.query
    const { payload } = req.body
    if (!uuid || !date || !payload) {
        return res.status(400).json({
            error: "User Information",
            message: "Could not retrieve user information"
        })
    }
    try {
        //const user = await getUserByUUID(uuid as string)
        const resultInfo = await getMedicInformationByUUID(uuid as string)
        //@ts-ignore
        //const availability = await getMedicAvailability(uuid)
        //@ts-ignore
        const availability = date ? await handleScheduleAvailability(uuid, date) : null
        //@ts-ignore
        resultInfo[0].schedule_preferences = await getMedicSchedule(uuid)
        //@ts-ignore
        resultInfo[0].availability = date ? availability : null
        //@ts-ignore
        resultInfo[0].schedule_preferences.schedule = checkAvailability(resultInfo[0].schedule_preferences.schedule, availability, date as string)
        //@ts-ignore
        return res.status(200).json(resultInfo[0])
    } catch (error: any) {
        console.log(error)
        throw new error(error.message)
    }
}
export const handleScheduleAvailability = async (uuid: string, today: string) => {
    /* const date = new Date()
    date.setUTCMinutes(date.getUTCMinutes() - date.getTimezoneOffset())
    // today[0] = "2024-04-20" today[1] = "04:20:00"
    const today = date.toISOString().split('T') */
    const availability = await getMedicAppointments(uuid, today)
    return availability
}