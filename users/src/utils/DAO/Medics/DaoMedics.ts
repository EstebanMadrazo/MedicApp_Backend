import mysql from 'mysql2/promise'
import { Medic } from '../../../models/MedicModel/Medic.ts';
import { generateDynamicSQLStatement } from '../../StringConstructor/stringconstructor.utils.ts';
import { SchedulePreferences } from '../../../controllers/schedule.controller.ts';
import { POOL } from '../DAO';


/*let con: mysql.Connection
export async function openDB_Connection():Promise<void>{
    
    try{
        con = await mysql.createConnection({
            host: process.env.PREMED_HOST,
            user: process.env.PREMED_USER,
            password:process.env.PREMED_PWD,
            database: process.env.PREMED_DB
        });
    }catch(e:any){
        console.log("Error connecting to DB ",new Date())
    }
}

export async function closeDB_Connection():Promise<void>{
    con.end()
}*/

export const storeMedicInDB = async (medic: Medic) =>{
    console.log(medic)
    //await openDB_Connection()
    const sql = 'INSERT INTO health_professionals (hp_uuid, professional_id, specialities, main_st, street_intersections, neighborhood, zip_address, city, office_state, country, rfc, is_emergency, is_approved, profile_picture, score) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    const values = [
        medic.uuid, 
        medic.professionalID, 
        medic.specialities, 
        medic.mainSt, 
        medic.streetIntersections, 
        medic.neighborhood,
        medic.zipAdress,
        medic.city,
        medic.office_state,
        medic.country,
        medic.rfc,
        medic.isEmergency,
        medic.isApproved,
        medic.profilePicture,
        medic.score,
    ]

    try{
        const connection = await POOL.getConnection()
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return "Success"
    }catch(error: any){
        console.log(error)
        throw new Error(error.message || error.sqlMessage)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicByUUID = async (uuid:string) => {
    try {
        const connection = await POOL.getConnection()
        //await openDB_Connection()
        const sql = 'SELECT * FROM health_professionals where hp_uuid = (?)'
        const value = [uuid]

        const [result, fields] = await connection.execute(sql, value)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result
    } catch (error: any) {
        console.log(error.message)
        throw new Error(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicsByState = async (state: string) => {
    try {
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        
        const sql = `SELECT u.uuid, u.given_name, u.family_name, hp.profile_picture, hp.specialities, hp.office_state, hp.main_st, hp.street_intersections, hp.neighborhood, hp.score, 
        sp.shift, sp.schedule, sp.limitTime, sp.duration, sp.price, sp.is_representative_allowed, sp.is_videocall_allowed
        FROM health_professionals AS hp 
        JOIN users AS u 
        ON hp.hp_uuid = u.uuid 
        JOIN schedule_preferences as sp
        ON u.uuid = sp.hp_uuid
        WHERE hp.office_state IN (${state})`

        const [result, fields] = await connection.execute(sql)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result
    } catch (error:any) {
        console.log(error.message)
        throw new Error(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicsBySpeciality = async (speciality:string[]) => {
    try {
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, hp.profile_picture, hp.specialities, hp.office_state, hp.main_st, hp.street_intersections, hp.neighborhood, hp.score, 
        sp.shift, sp.schedule, sp.limitTime, sp.duration, sp.price, sp.is_representative_allowed, sp.is_videocall_allowed
        FROM health_professionals AS hp 
        JOIN users AS u 
        ON hp.hp_uuid = u.uuid 
        JOIN schedule_preferences as sp
        ON u.uuid = sp.hp_uuid
        WHERE (${generateDynamicSQLStatement(speciality)})`
        const [result, fields] = await connection.execute(sql)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result as Array<Medic>
    } catch (error: any) {
        console.log(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicsByKeyword = async (keyword:string) => {
    try {
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, hp.profile_picture, hp.specialities, hp.office_state, hp.main_st, hp.street_intersections, hp.neighborhood, hp.score, 
        sp.shift, sp.schedule, sp.limitTime, sp.duration, sp.price, sp.is_representative_allowed, sp.is_videocall_allowed
        FROM health_professionals AS hp 
        JOIN users AS u 
        ON hp.hp_uuid = u.uuid 
        JOIN schedule_preferences as sp
        ON u.uuid = sp.hp_uuid
        WHERE (u.given_name LIKE '%${keyword}%' OR u.family_name LIKE '%${keyword}%')`
        const [result, fields] = await connection.execute(sql)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result as Array<Medic>
    } catch (error: any) {
        console.log(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicsBy_Speciality_State_Keyword = async (specialities:string[], states:string, keyword:string) =>{
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, hp.profile_picture, hp.specialities, hp.office_state, hp.main_st, hp.street_intersections, hp.neighborhood, hp.score, 
        sp.shift, sp.schedule, sp.limitTime, sp.duration, sp.price, sp.is_representative_allowed, sp.is_videocall_allowed
        FROM health_professionals AS hp 
        JOIN users AS u 
        ON hp.hp_uuid = u.uuid 
        JOIN schedule_preferences as sp
        ON u.uuid = sp.hp_uuid
        WHERE (${generateDynamicSQLStatement(specialities)})
        AND hp.state IN (${states})
        AND (u.given_name LIKE '%${keyword}%' OR u.family_name LIKE '%${keyword}%')`
        console.log(sql)
        const [result,fields] = await connection.execute(sql)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result
    }catch(error:any){
        console.log(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicsBy_Speciality_State = async (specialities:string[], states:string) =>{
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, hp.profile_picture, hp.specialities, hp.office_state, hp.main_st, hp.street_intersections, hp.neighborhood, hp.score, 
        sp.shift, sp.schedule, sp.limitTime, sp.duration, sp.price, sp.is_representative_allowed, sp.is_videocall_allowed
        FROM health_professionals AS hp 
        JOIN users AS u 
        ON hp.hp_uuid = u.uuid 
        JOIN schedule_preferences as sp
        ON u.uuid = sp.hp_uuid
        WHERE (${generateDynamicSQLStatement(specialities)})
        AND hp.office_state IN (${states})`
        console.log(sql)
        const [result,fields] = await connection.execute(sql)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result
    }catch(error:any){
        console.log(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicsBy_Speciality_Keyword = async (specialities:string[], keyword:string) =>{
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, hp.profile_picture, hp.specialities, hp.office_state, hp.main_st, hp.street_intersections, hp.neighborhood, hp.score, 
        sp.shift, sp.schedule, sp.limitTime, sp.duration, sp.price, sp.is_representative_allowed, sp.is_videocall_allowed
        FROM health_professionals AS hp 
        JOIN users AS u 
        ON hp.hp_uuid = u.uuid 
        JOIN schedule_preferences as sp
        ON u.uuid = sp.hp_uuid
        WHERE (${generateDynamicSQLStatement(specialities)})
        AND (u.given_name LIKE '%${keyword}%' OR u.family_name LIKE '%${keyword}%')`
        console.log(sql)
        const [result,fields] = await connection.execute(sql)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result
    }catch(error:any){
        console.log(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicsBy_State_Keyword = async (states:string, keyword:string) =>{
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, hp.profile_picture, hp.specialities, hp.office_state, hp.main_st, hp.street_intersections, hp.neighborhood, hp.score, 
        sp.shift, sp.schedule, sp.limitTime, sp.duration, sp.price, sp.is_representative_allowed, sp.is_videocall_allowed
        FROM health_professionals AS hp 
        JOIN users AS u 
        ON hp.hp_uuid = u.uuid 
        JOIN schedule_preferences as sp
        ON u.uuid = sp.hp_uuid
        WHERE hp.state IN (${states})
        AND (u.given_name LIKE '%${keyword}%' OR u.family_name LIKE '%${keyword}%')`
        console.log(sql)
        const [result,fields] = await connection.execute(sql)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result
    }catch(error:any){
        console.log(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

type shift = {
    morning: string[],
    afternoon: string[]
}

export type MedicSchedule = {
    shift: shift
    schedule: Object,
    limitTime: string,
    duration: string,
    price: number,
    is_videocall_allowed: boolean,
    is_rep_allowed: boolean
}
export const getMedicSchedule = async (uuid: string) =>{
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'SELECT hp_uuid, shift ,schedule, limitTime, duration, is_representative_allowed, is_videocall_allowed, price FROM schedule_preferences where hp_uuid = (?)'
        const value = [uuid]

        const [result, fields]: [any, any] = await connection.execute(sql, value) as unknown as any
        console.log(result)
        const medicSchedule:MedicSchedule = {
            shift: result[0].shift,
            schedule: result[0].schedule,
            limitTime: result[0].limitTime,
            duration: result[0].duration,
            price: result[0].price,
            is_rep_allowed: result[0].is_representative_allowed,
            is_videocall_allowed: result[0].is_videocall_allowed,
        }
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return medicSchedule
    }catch(error: any){
        console.log(error)
        throw new Error(error.sqlMessage)
    }finally{
        //await closeDB_Connection() 
    }
}

export const getAllSpecialities = async () =>{
    try {
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        //const sql = "SELECT DISTINCT (specialities) FROM health_professionals"
        const sql = "SELECT DISTINCT JSON_EXTRACT(specialities, '$.specialities[*].name') FROM health_professionals"
        const [result, fields] = await connection.execute(sql)
        console.log(result)
        //console.log(fields)
        const resultArray = result as Array<string[]>
        // @ts-ignore
        const parsedArray = resultArray.map(obj => obj["JSON_EXTRACT(specialities, '$.specialities[*].name')"]);
        //console.log("Parsed Array",parsedArray)
        //await closeDB_Connection()
        connection.release()
        return parsedArray
    } catch (error: any) {
        console.log(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicInformation = async (account: string) => {
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, u.sex, u.birthdate, u.state, u.email, u.phone_number, u.role, hp.*
        FROM health_professionals as hp
        JOIN users as u
        ON hp.hp_uuid = u.uuid 
        WHERE email = (?)`
        
        const value = [account]

        const [result, fields] = await connection.execute(sql,value)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result
    }catch(error:any){
        console.log(error)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicInformationByUUID = async (uuid: string) => {
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, u.sex, u.birthdate, u.state, u.email, u.phone_number, u.role, hp.*,
        sp.shift, sp.schedule, sp.limitTime, sp.duration, sp.price, sp.is_representative_allowed, sp.is_videocall_allowed
        FROM health_professionals as hp
        JOIN users as u
        ON hp.hp_uuid = u.uuid
        JOIN schedule_preferences as sp
        ON u.uuid = sp.hp_uuid
        WHERE u.uuid = (?)`
        
        const value = [uuid]

        const [result, fields] = await connection.execute(sql,value)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        return result
    }catch(error:any){
        console.log(error)
    }finally{
        //await closeDB_Connection()
    }
}

export const updateMedicScore = async(uuid:string, score:number) => {
    
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'UPDATE health_professionals SET score = (?) WHERE hp_uuid = (?)'
        const values = [score, uuid]
        const [result, fields] = await connection.execute(sql, values)
        //await closeDB_Connection()
        connection.release()
        return result
    }catch(error: any){
        console.log(error)
        throw new Error(error)
    }finally{
        //await closeDB_Connection()
    }
}

export const updateSchedulePreferences = async (schedulePreferences:SchedulePreferences) =>{
    
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'UPDATE schedule_preferences SET shift = (?), schedule = (?), limitTime = (?), duration = (?), is_representative_allowed = (?), is_videocall_allowed = (?), price = (?)  WHERE hp_uuid = (?)'
        const values = [
            schedulePreferences.shift,
            schedulePreferences.time_table,
            schedulePreferences.limitTime,
            schedulePreferences.duration,
            schedulePreferences.is_rep_allowed,
            schedulePreferences.is_videocall_allowed,
            schedulePreferences.price, 
            schedulePreferences.uuid
        ]
        const [result, fields] = await connection.execute(sql, values)
        //await closeDB_Connection()
        //@ts-ignore
        if (result.changedRows === 0) {
            throw new Error("No row matches")
        }
        connection.release()
    }catch(error: any){
        console.log(error)
        throw new Error(error)
    }finally{
        //await closeDB_Connection()
    }
}

export const storeSchedule = async (medicSchedule:SchedulePreferences) => {
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'INSERT INTO schedule_preferences (hp_uuid, shift, schedule, limitTime, duration ,is_representative_allowed, is_videocall_allowed, price) values (?,?,?,?,?,?,?,?)'
        const values = [
            medicSchedule.uuid, 
            medicSchedule.shift,
            medicSchedule.time_table,
            medicSchedule.limitTime,
            medicSchedule.duration,
            medicSchedule.is_rep_allowed, 
            medicSchedule.is_videocall_allowed, 
            medicSchedule.price 
        ]

        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        //await closeDB_Connection()
        connection.release()
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export interface Availability{
    id?:number,
    uuid?:string,
    date:string,
    time:string
}

export const storeMedicAvailability = async (date:string, time:string, uuid:string) => {
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'INSERT INTO health_professionals_availability (hp_uuid, date, time) values (?,?,?)'
        const values = [uuid, date, time]
        const[result, fields] = await connection.execute(sql, values)
        console.log(result)
        //await closeDB_Connection()
        connection.release()
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const getMedicAvailability = async(uuid:string) => {
    try{
        const connection = await POOL.getConnection()
        const sql = 'SELECT * FROM health_professionals_availability WHERE hp_uuid = (?)'
        const values = [uuid]
        const[result, fields] = await connection.execute(sql, values)
        console.log(result)
        connection.release()
        return result as Availability[]
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}

export const freeMedicAvailability = async (date:string, time:string, uuid:string) => {
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'DELETE FROM health_professionals_availability WHERE hp_uuid = (?) and date = (?) and time = (?)'
        const values = [uuid, date, time]
        const[result, fields] = await connection.execute(sql, values)
        console.log(result)
        //await closeDB_Connection()
        connection.release()
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }finally{
        //await closeDB_Connection()
    }
}
type updateAvailability = {
    hp_uuid:string,
    new_date:string
    new_time:string
    old_date:string
    old_time:string
}
export const updateMedicAvailability = async (content:updateAvailability) => {
    try{
        const connection = await POOL.getConnection()
        console.log(content.new_date)
        console.log(content.new_time)
        console.log(content.hp_uuid)
        console.log(content.old_date)
        console.log(content.old_time)
        const sql = 'UPDATE health_professionals_availability SET date = (?), time = (?) WHERE (hp_uuid = (?) AND date = (?) AND time = (?))'
        const values = [content.new_date, content.new_time, content.hp_uuid, content.old_date, content.old_time]
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        //@ts-ignore
        if(result.affectedRows === 0 ){
            console.log('Cannot update result')
        }
        connection.release()
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}

export const getMedicAppointments = async (uuid:string, date:string) => {
    try{
        const connection = await POOL.getConnection()
        const sql = 'SELECT date, time FROM health_professionals_availability WHERE hp_uuid = (?) and date=(?)'
        const values = [uuid, date]
        const[result, fields] = await connection.execute(sql, values)
        console.log(result)
        connection.release()
        return result as Availability[]
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}

export const getAllMedics = async () => {
    try{
        const connection = await POOL.getConnection()
        const sql ='SELECT * FROM users as u JOIN health_professionals as hp ON u.uuid = hp.hp_uuid'
        const [result, fields] = await connection.execute(sql)
        connection.release()
        return result
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}