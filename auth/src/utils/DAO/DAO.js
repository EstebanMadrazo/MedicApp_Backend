import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()
let connection

//--- INITIAL CONFIGURATION ---
export const initializeService = async () => {
    try {
        await createDatabase()
        await createTables()
    } catch (error) {
        console.log(error)
    }

    console.log('Initialization Completed')
}
const createDatabase = async () => {
    let connection
    try {
        connection = await mysql.createConnection({
            host: process.env.PREMED_HOST,
            user: process.env.PREMED_USER,
            password: process.env.PREMED_PWD
        })

        const createDatabase = ('CREATE DATABASE IF NOT EXISTS premed_auth')
        await connection.execute(createDatabase)

    } catch (error) {
        console.log(error)
        //throw new Error("Couldn't stablish database connection")
    } finally {
        await connection.end()
    }

    console.log('Database Created Successfully')
}

const createTables = async () => {
    let connection
    try {
        connection = await mysql.createConnection({
            host: process.env.PREMED_HOST,
            user: process.env.PREMED_USER,
            password: process.env.PREMED_PWD,
            database: process.env.PREMED_DB
        })
        let createTable = ('CREATE TABLE IF NOT EXISTS users (uuid varchar(36) UNIQUE, username varchar(255) UNIQUE, password varchar(256))')
        await connection.execute(createTable)

        createTable = ('CREATE TABLE IF NOT EXISTS tokens (user_uuid varchar(36), user_token varchar(1024), CONSTRAINT fk_user_uuid FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON UPDATE CASCADE ON DELETE NO ACTION)')
        await connection.execute(createTable)

    } catch (error) {
        console.log(error)
        throw new Error("Couldn't create tables", error.message)
    } finally {
        await connection.end()
    }

    console.log('Tables Created Successfully')
}

// --- CONNECTION METHODS ---
export const openDB_Connection = async () => {
    try {
        connection = mysql.createPool({
            host: process.env.PREMED_HOST,
            user: process.env.PREMED_USER,
            password: process.env.PREMED_PWD,
            database: process.env.PREMED_DB,
            connectionLimit: 20,
            connectTimeout: 10000
        })
    } catch (error) {
        console.log(error)
        throw new Error("Couldn't stablish database connection")
    }
}

const close_DBConnection = async () => {
    try {
        await connection.end()
    } catch (error) {
        console.log(error)
    }
}

// --- DAO METHODS ---

export const validateCredentials = async (account, password) => {
    //await openDB_Connection()
    const sql = 'SELECT * FROM users where username = (?)'
    const values = [account]
    try {
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        console.log(fields)
        if (result.length === 0) {
            throw new Error('Incorrect Username or Password')
        }
        //await close_DBConnection()
        return result
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    } finally {
        //await close_DBConnection()
    }
}

export const setFirstLogin = async (data) => {
    console.log(data)
    try{
        const state = data.content.isFirstLogin
        //await openDB_Connection()
        const sql = 'UPDATE users SET is_first_login = (?) WHERE uuid = (?)'
        const values = [!state, data.content.uuid]
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        //await close_DBConnection()
    }catch(error){
        console.log(error.message)
        throw new Error(error.message)
    }finally{
        //await close_DBConnection()
    }
}
export const storeUserInDB = async (data) => {
    console.log("Store user in db", data)
    //await openDB_Connection()
    const sql = 'INSERT INTO users (uuid, username, password, role, is_first_login, is_access_restricted, is_deleted) values (?,?,?,?,?,?,?)'
    //const uuid = data.uuid?.generateUUID()
    //const hashedPassword = hashPassword(data.password)
    const values = [data.content.uuid, data.content.username, data.content.password, data.content.role, data.content.is_first_login, data.content.access, data.content.deleted]

    try {
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        console.log(fields)
        //await close_DBConnection()
        return result
    } catch (error) {
        console.log(error)
    } finally {
        //await close_DBConnection()
    }
    console.log('Successfully Created User in database')
}

export const storeTokenInDB = async (data) => {
    try {
        //await openDB_Connection()
        //const con = connection
        const sql = 'INSERT INTO tokens (user_uuid, user_token) values (?,?)'
        const uuid = await getUUIDByUser(data.user)
        console.log(uuid[0].uuid)

        const values = [uuid[0].uuid, data.refreshToken]
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        console.log(fields)
        //con.end()
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    } finally {
       // await close_DBConnection()
    }

    console.log('Successfully stored token in DB')
}

export const getUUIDByUser = async (username) => {
    //await openDB_Connection()
    const sql = 'SELECT * FROM users where username = (?)'
    const value = [username]

    try {
        const [result, fields] = await connection.execute(sql, value)
        console.log(result)
        console.log(fields)
        //await close_DBConnection()
        return result
    } catch (error) {
        console.log(error)
    } finally {
        //await close_DBConnection()
    }

}

export async function storeEvent(event) {
    console.log("Entered Store Event")
    console.log(event)
    try {
        //await openDB_Connection()
        const sql = 'INSERT INTO events (event_uuid, content) values (?,?)'
        const values = [event.eventUUID, event.content]

        const [result, fields] = await connection.execute(sql, values)
        console.log("Results from Store Event")
        console.log(result)
        console.log(fields)
    } catch (error) {
        console.log(error.message)
    } finally {
        //await close_DBConnection()
    }
}

export async function findToken(token) {
    //await openDB_Connection()
    const sql = 'SELECT * FROM tokens where user_token = (?)'
    const value = [token]

    try {

        const [result, fields] = await connection.execute(sql, value)
        console.log(result)
        console.log(fields)
        if (result.length === 0) {
            throw new Error('Token not found')
        }
        //await close_DBConnection()
        return result
    } catch (error) {
        console.log(error.message)
        return (error.message)
    }finally{
        //await close_DBConnection()
    }
}

export async function removeToken(token) {
    //await openDB_Connection()
    const sql = 'DELETE FROM tokens where user_token = (?)'
    const value = [token]
    try {
        const [result] = await connection.execute(sql, value)
        //await close_DBConnection()
        return result
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }finally{
        //await close_DBConnection()
    }
}

export async function storeEventInDB(event) {
    console.log("DAO: ", event)
    //await openDB_Connection()
    const sql = 'INSERT INTO events (event_uuid, content) values (?,?)'
    const values = [event.content.uuid, event.content]
    console.log(values)
    try {
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        console.log(fields)
        //await close_DBConnection()
        return result
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    } finally {
        //await close_DBConnection()
    }
}

export async function updateUserInDB(data) {
    //await openDB_Connection()
    const sql = 'UPDATE users SET password = (?) WHERE uuid = (?)'
    const values = [data.content.password, data.content.uuid]
    console.log(values)
    try {
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        console.log(fields)
        //await close_DBConnection()
        return result
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    } finally {
        //await close_DBConnection()
    }
}

export async function deleteUser(data) {
    console.log(data.content)
    try {
        //await openDB_Connection()
        const sql = 'UPDATE users SET is_access_restricted = 1, is_deleted = 1 WHERE username = (?)'
        const values = [data.content.username]
        console.log(values)
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        console.log(fields)
        //await close_DBConnection()
        return result
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    } finally {
        //await close_DBConnection()
    }
}