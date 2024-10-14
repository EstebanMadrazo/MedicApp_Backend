// --- Imports ---
import mysql from 'mysql2/promise'
import env from 'dotenv'
import crypto from 'crypto'

// --- Constants ---
env.config()
let con = null

// --- Functions ---
export async function openDBConnection() {
    try {
        con = mysql.createPool({
            host: process.env.PREMED_HOST,
            user: process.env.PREMED_USER,
            password: process.env.PREMED_PWD,
            database: process.env.PREMED_DB,
            connectionLimit: 20,
            connectTimeout: 10000
        })
    } catch (error) {
        console.log("Error connecting to DB ", error)
    }
    console.log("Connection successfully open")
}

async function closeDBConnection() {
    await con.end()
}

export async function storeEvent(event) {
    const uuid = crypto.randomUUID()
    //const stripped = uuid.replaceAll('-', '')
    console.log("Original: ", uuid)
    //console.log("Stripped: ", stripped)

    //await openDBConnection()

    try {
        const sql = 'INSERT INTO events (uuid_event, content) values (?,?)'
        const values = [uuid, event]

        const [result, fields] = await con.execute(sql, values)
        console.log(result)
        console.log(fields)
    } catch (error) {
        console.log(error)
    } finally {
        //await closeDBConnection()
    }

    return uuid
}

export async function getEvents() {

    let events = null
    //await openDBConnection()

    try {

        const sql = 'SELECT * FROM events'
        const [result, fields] = await con.execute(sql)

        console.log(result)
        console.log(fields)
        events = result
    } catch (error) {
        console.log(error)
    } finally {
        //await closeDBConnection()
    }

    return events

}

export async function getEventByID(uuid) {
    try {
        //await openDBConnection()

        const sql = 'SELECT * FROM events where uuid_event = (?)'
        const values = [uuid]
        const [result, fields] = await con.execute(sql, values)

        console.log(result)
        console.log(fields)
    } catch (error) {
        console.log(error)
    } finally {
        //await closeDBConnection()
    }
}

