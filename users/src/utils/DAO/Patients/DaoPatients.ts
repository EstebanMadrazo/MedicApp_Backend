//import mysql from 'mysql2/promise'
import { Patient } from '../../../models/PatientModel/Patient';
import { POOL } from '../DAO';

/*let con:mysql.Connection

const openDB_Connection = async() => {
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

const closeDB_Connection = async() => {
    await con.end()
}*/

export const storePatientInDB = async (patient: Patient) =>{
    //await openDB_Connection()
    const sql = 'INSERT INTO patients (patient_uuid, health_questionnaire, payment_methods, profile_picture, is_access_restricted, score) values (?,?,?,?,?,?)'
    const values = [patient.uuid, patient.healthQuestionnaire, patient.payment_methods, patient.profile_picture, patient.is_access_retricted, patient.score]

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
        throw new Error(error.sqlMessage)
    }finally{
        //await closeDB_Connection()
    }
}
export async function getPatientInformation(account: string){
    try{
        const connection = await POOL.getConnection()
        //await openDB_Connection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, u.sex, u.birthdate, u.state, u.email, u.phone_number, u.role, p.profile_picture, p.score, p.health_questionnaire 
        FROM patients as p
        JOIN users as u
        ON p.patient_uuid = u.uuid 
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
        throw new Error(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const getPatientInformationByUUID = async (uuid: string) => {
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, u.sex, u.birthdate, u.state, u.email, u.phone_number, u.role, p.*
        FROM patients as p
        JOIN users as u
        ON p.patient_uuid = u.uuid 
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

export const updatePatientScore = async(uuid:string, score:number) => {
    //await openDB_Connection()
    
    try{
        const connection = await POOL.getConnection()
        const sql = 'UPDATE patients SET score = (?) WHERE patient_uuid = (?)'
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

export const updateQuestionnaire = async (questionnaire:Object, uuid:string) =>{
    
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'UPDATE patients SET health_questionnaire = (?) WHERE patient_uuid = (?)'
        const values = [questionnaire, uuid]
        const [result, fields] = await connection.execute(sql, values)
        //await closeDB_Connection()
        console.log(result)
        //@ts-ignore
        if (result.affectedRows === 0) {
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

export const getAllPatients = async () => {
    try{
        const connection = await POOL.getConnection()
        const sql ='SELECT * FROM users as u JOIN patients as p ON u.uuid = p.patient_uuid'
        const [result, fields] = await connection.execute(sql)
        connection.release()
        return result
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}