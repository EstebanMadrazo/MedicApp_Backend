import mysql from 'mysql2/promise'
import { Appointment, AppointmentDB } from '../../models/appointment.model.ts';
import { AppointmentRequest } from '../../models/appointmentRquest.model.ts';
import { Review } from '../../models/review.model.ts';
import { POOL } from './dao.config.ts';


//let connection: mysql.Connection
/*
export const initializeService = async () =>{
    try{
        await createDatabase(),
        await createTables()
    }catch(error:any){
        console.log(error)
    }
    console.log("Service initialized correctly")
}
/*
const createDatabase = async (): Promise<void> => {
    let conn
    try{
        conn = await mysql.createConnection({
            host: process.env.PREMED_HOST,
            user: process.env.PREMED_USER,
            password:process.env.PREMED_PWD
        });

        const createDatabase = `CREATE DATABASE IF NOT EXISTS ${process.env.PREMED_DB}`
        await conn.execute(createDatabase)
    }catch(e:any){
        console.log("Error creating DB ",new Date())
        throw new Error("Error creating DB, "+new Date())
    }finally{
        await conn?.end()
    }
}

const createTables = async ():Promise<void> => {
    let conn
    try{
        conn = await mysql.createConnection({
            host: process.env.PREMED_HOST,
            user: process.env.PREMED_USER,
            password:process.env.PREMED_PWD,
            database: process.env.PREMED_DB
        });

        let sql = `CREATE TABLE IF NOT EXISTS appointments (
            uuid varchar(36) NOT NULL,
            user_uuid varchar(36) NOT NULL,
            health_professional_uuid varchar(36) NOT NULL,
            date datetime NOT NULL,
            total double(7,2) NOT NULL,
            is_reschedule_available boolean NOT NULL DEFAULT true,
            is_prioritary boolean NOT NULL,
            confirmation_code varchar(45) NOT NULL,
            exit_questionnaire json NOT NULL,
            is_verified boolean NOT NULL DEFAULT false,
            PRIMARY KEY (uuid),
            UNIQUE KEY id_UNIQUE (uuid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`

        await conn.execute(sql)

        sql = `CREATE TABLE events (
            event_uuid varchar(36) NOT NULL,
            event_content json NOT NULL,
            PRIMARY KEY (evnet_uuid),
            UNIQUE KEY id_UNIQUE (event_uuid)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
          await conn.execute(sql)

        }catch(error: any){
            console.log("Error creating tables")
            console.log(error)
            throw new Error(error)
        }finally{
            await conn?.end()
        }
}

/*const openDB_Connection = async ():Promise<void> =>{
        
    try{
        connection = await mysql.createConnection({
            host: process.env.PREMED_HOST,
            user: process.env.PREMED_USER,
            password:process.env.PREMED_PWD,
            database: process.env.PREMED_DB,
            dateStrings:['DATE', 'DATETIME'],
            idleTimeout: 10
        });
        connection.on('connection', async ()=>{
            console.log('Connected to DB')
            await connection.query('SET time_zone="+00:00";')
        })
    }catch(e:any){
        console.log(e)
        console.log("Error connecting to DB ",new Date())
    }

    //return connection;
}

const closeDB_Connection = async(): Promise<void> => {
    await connection.end()
}*/


export const storeAppointmentInDB = async (appointment: Appointment) => {
    //await openDB_Connection()
    try{
        const connection = await POOL.getConnection()
        const sql = 'INSERT INTO appointments (uuid, user_uuid, health_professional_uuid, date, total, is_prioritary, confirmation_code, exit_questionnaire) VALUES (?,?,?,?,?,?,?,?)'
        const values = [
            appointment.getAppointmentUUID(),
            appointment.getPatientUUID(),
            appointment.gethealthProfUUID(),
            appointment.getAppointmentDate(),
            appointment.getTotal(),
            appointment.getIsPrioritary(),
            appointment.getConfirmationCode(),
            appointment.getExitQuestionnaire()
        ]

        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        console.log(fields)
        connection.release()
    }catch(error:any){
        console.log(error)
        throw new Error(error)
    }finally{
        //await closeDB_Connection()
    }
}

export const getAppointment = async(appointmentUUID: string) => {
    //await openDB_Connection()
    try{
        const connection = await POOL.getConnection()
        const sql = 'SELECT * FROM appointments where uuid = (?) and is_cancelled = 0 order by date asc'
        const value = [appointmentUUID]

        const [result, fields] = await connection.execute(sql, value)
        //console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        //@ts-ignore
        return result[0]
    }catch(error:any){
        console.log(error)
    }finally{
        //await closeDB_Connection()
    }
}

export const getAppointmentByUserUUID = async (userUUID:string) => {
    //await openDB_Connection()
    try{
        const connection = await POOL.getConnection()
        const sql = 'SELECT * FROM appointments WHERE (user_uuid = (?) or health_professional_uuid = (?)) and is_cancelled = 0 order by date asc'
        const value = [userUUID, userUUID]

        const [result, fields] = await connection.execute(sql, value)
        //console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result
    }catch(error:any){
        console.log(error)
        throw new Error(error)
    }finally{
        //await closeDB_Connection()
    }
}

export const updateAppointment = async(appointment: Appointment) => {
    //await openDB_Connection()

    try{
        const connection = await POOL.getConnection()
        const sql = 'UPDATE appointments SET date = (?) where uuid = (?)'
        const values = [
            appointment.getAppointmentDate(), 
            appointment.getAppointmentUUID()
        ]
        const [result, fields] = await connection.execute(sql, values)

        console.log(result)
        //await closeDB_Connection()
        connection.release()
        return "Success"
    }catch(error:any){
        console.log(error.sqlMessage)
    }finally{
        //await closeDB_Connection()
    }
}

export const storeAppointmentRequest = async (request: AppointmentRequest) => {
    //await openDB_Connection()
    let status
    try{
        const connection = await POOL.getConnection()
        const sql = 'INSERT INTO reschedule_request (request_uuid, appointment_uuid, new_date) VALUES (?,?,?)'
        const values = [
            request.getRequestUUID(), 
            request.getAppointmentUUID(), 
            request.getNewDate()
        ]

        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        console.log(fields)
        status="Success"
        connection.release()
    }catch(error: any){
        console.log(error)
        status="Failed"
    }finally{
        //await closeDB_Connection()
    }
    return status
}

export const getAppointmentRequest = async (uuid:string) => {
    //await openDB_Connection()

    try{
        const connection = await POOL.getConnection()
        const sql = 'SELECT * FROM reschedule_request WHERE request_uuid = (?)'
        const value = [uuid]
        const [result, fields] = await connection.execute(sql, value)
        //await closeDB_Connection()
        connection.release()
        return result
    }catch(error: any){
        console.log(error)
    }finally{
        //await closeDB_Connection()
    }
}
export const updateAppointmentCancel = async(appointment:Appointment ) => {
    //await openDB_Connection()

    try{
        const connection = await POOL.getConnection()
        const sql = 'UPDATE appointments SET is_cancelled = (?) where uuid = (?)'
        const values = [
            appointment.getIsCancelled(), 
            appointment.getAppointmentUUID()
        ]
        const [result, fields] = await connection.execute(sql, values)

        console.log(result)
        //await closeDB_Connection()
        connection.release()
        return "Success"
    }catch(error:any){
        console.log(error.sqlMessage)
    }finally{
        //await closeDB_Connection()
    }
}

export const storeReview = async (review:Review) => {
    //await openDB_Connection()
    try{
        const connection = await POOL.getConnection()
        const sql = 'INSERT INTO reviews (appointment_uuid, evaluator_uuid, subject_uuid, score) values (?,?,?,?)'
        const values = [review.appointment_uuid, review.evaluator_uuid, review.subject_uuid, review.score]

        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        //await closeDB_Connection()
        connection.release
        return "Success"
    }catch(error: any){
        console.log(error)
        throw new Error(error.sqlMessage)
    }finally{
        //await closeDB_Connection()
    }
}

export const getReviewsScoreFromSubject = async (subject: string) => {
    //await openDB_Connection()
    try{
        const connection = await POOL.getConnection()
        const sql = 'SELECT SUM(score) AS total_score, COUNT(*) AS total_rows FROM reviews where subject_uuid = (?)'
        const value = [subject]

        const [result, fields] = await connection.execute(sql, value)
        //await closeDB_Connection()
        connection.release()
        //@ts-ignore
        return result[0]
    }catch(error: any){
        console.log(error)
        throw new Error(error)
    }finally{
        //await closeDB_Connection()
    }
}

export const updateReviewScore = async (id:number, score:number) => {
    try{
        const connection = await POOL.getConnection()
        const sql = 'UPDATE reviews SET score = (?) WHERE id = (?)'
        const values = [score, id]
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        //@ts-ignore
        if(result.changedRows === 0) {
            throw new Error("No Appointment match or can't change with same value")
        }
        connection.release()
    }catch(error:any){
        throw new Error(error.message)
    }
}

export const deleteAppointmentsFromMedic = async (uuid:string)=>{
    try{
        const connection = await POOL.getConnection()
        //await openDB_Connection()
        const sql = 'CALL DeleteNoPriorityAppointmentsFromMedic((?))'
        const value = [uuid]
        const [result,fields] = await connection.execute(sql, value)
        console.log(result)
        console.log(fields)
        //await closeDB_Connection()
        connection.release()
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}

export const getAppointmentsReport = async(uuid:string, date:string) => {
    try{
        const connection = await POOL.getConnection()
        const sql = 'SELECT * FROM appointments WHERE (user_uuid = (?) OR health_professional_uuid = (?)) AND date like (?)'
        const values = [uuid,uuid,`${date}%`]
        const [result, fields] = await connection.execute(sql,values)
        console.log(result)
        connection.release
        return result
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}

export const updateReviewComment = async (id:number, comment:string) => {
    try{
        const connection = await POOL.getConnection()
        const sql = 'UPDATE reviews SET comments = (?) WHERE id = (?)'
        const values = [comment, id]
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        connection.release()
    }catch(error:any){
        throw new Error(error.message)
    }
}

export const getAppointmentDetails = async (date:string, time:string, uuid:string) => {
    try{
        const connection = await POOL.getConnection()
        const appDate = `${date} ${time}`
        console.log(appDate)
        console.log(uuid)
        const sql = 'SELECT * FROM appointments where date = (?) AND (user_uuid = (?) OR health_professional_uuid = (?))'
        const values = [appDate, uuid, uuid]
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        connection.release()
        return result as unknown as Array<AppointmentDB>
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}

export const getAppointmentByDate = async (date:string, uuid:string) =>{
    try{
        const connection = await POOL.getConnection()
        const sql = 'SELECT * FROM appointments where date like (?) AND (user_uuid = (?) OR health_professional_uuid = (?))'
        const value = [`${date}%`, uuid, uuid]
        const [result, fields] = await connection.execute(sql,value)
        console.log(result)
        connection.release()
        return result as Array<AppointmentDB>
    }catch(error:any){
        console.log(error.message)
        throw new Error(error.message)
    }
}

export const getAppointmentByMonth = async (month:string, uuid:string) => {
    try{
        const connection = await POOL.getConnection()
        const sql = 'SELECT * FROM appointments where date like (?) AND (user_uuid = (?) OR health_professional_uuid = (?))'
        const value = [`${month}%`, uuid, uuid]
        const [result, fields] = await connection.execute(sql,value)
        console.log(result)
        connection.release()
        return result as Array<AppointmentDB>
    }catch(error:any){
        console.log(error.message)
        throw new Error(error.message)
    }
}

export const storeAppointmentComment = async (comment:object, appointment_uuid: string) => {
    try{
        const connection = await POOL.getConnection()
        const sql = 'UPDATE appointments SET exit_questionnaire = (?) where uuid = (?)'
        const values = [comment, appointment_uuid]
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        connection.release()
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}