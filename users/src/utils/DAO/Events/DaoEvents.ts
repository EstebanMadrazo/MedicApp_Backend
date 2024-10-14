//import mysql, { Connection } from 'mysql2/promise'

import { connect } from "http2"
import { POOL } from "../DAO"

/*let connection: Connection
export async function openDB_Connection(): Promise<void> {

    try {
        connection = await mysql.createConnection({
            host: process.env.PREMED_HOST,
            user: process.env.PREMED_USER,
            password: process.env.PREMED_PWD,
            database: process.env.PREMED_DB
        });
    } catch (e: any) {
        console.log("Error connecting to DB ", new Date())
    }

}

export async function closeDB_Connection(): Promise<void> {
    connection.end()
}*/

interface UserObjectEvent {
    user_uuid: string,
    event: string,
    timestamp: Date
}
interface Event {
    eventUUID: string,
    content: UserObjectEvent
}

export async function storeEvent(event: Event) {
    console.log("Entered Store Event")
    console.log(event)
    try {
        const connection = await POOL.getConnection()
        //await openDB_Connection()
        const sql = 'INSERT INTO user_events (uuid_event, event_body) values (?,?)'
        const values = [event.eventUUID, event.content]

        const [result, fields] = await connection.execute(sql, values)
        console.log("Results from Store Event")
        console.log(result)
        //console.log(fields)
        connection.release()
    } catch (error: any) {
        console.log(error.message)
    } finally {
        //await closeDB_Connection()
    }
}

export async function retrieveEventByID(uuid: String) {
    try {
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'SELEC * FROM user_events where uuid_event = (?)'
        const value = [uuid]

        const [result, fields] = await connection.execute(sql, value)
        console.log("Results from Store Event")
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result as unknown as Event
    } catch (error: any) {
        console.log(error.messasge)
        throw new Error(error.message)
    } finally {
        //await closeDB_Connection()
    }
}