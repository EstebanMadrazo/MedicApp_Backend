//import mysql from 'mysql2/promise'
import { Product, Representative } from '../../../models/RepresentativeModel/Representative';
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

export const storeRepresentativeInDB = async (representative: Representative) =>{
    //await openDB_Connection()
    const sql = `INSERT INTO health_representative (rep_uuid, product_catalog, payment_methods, profile_picture, is_access_restricted, score, laboratory) values (?,?,?,?,?,?,?)`
    const values = [
        representative.getUUID(), 
        representative.getProductCatalog(), 
        representative.getPaymentMethods(), 
        representative.getProfilePicture(), 
        representative.getIsAccessRestricted(), 
        representative.getScore(),
        representative.getLaboratory()
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
        throw new Error(error.sqlMessage)
    }finally{
        //await closeDB_Connection()
    }
}

export async function getRepresentativeInformation(account: string){
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, u.birthdate, u.state, u.email, u.phone_number, u.role ,hr.profile_picture, hr.score, hr.product_catalog 
        FROM health_representative as hr
        JOIN users as u
        ON hr.rep_uuid = u.uuid 
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

export async function getRepresentativeInformationByUUID(uuid: string){
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = `SELECT u.uuid, u.given_name, u.family_name, u.sex, u.birthdate, u.state, u.email, u.phone_number, u.role ,hr.*
        FROM health_representative as hr
        JOIN users as u
        ON hr.rep_uuid = u.uuid 
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

export const updateRepresentativeScore = async(uuid:string, score:number) => {
    //await openDB_Connection()
    
    try{
        const connection = await POOL.getConnection()
        const sql = 'UPDATE health_representative SET score = (?) WHERE rep_uuid = (?)'
        const values = [score, uuid]
        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
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

export const updateProductsCatalog = async (productCatalog:Array<Product>, uuid:string) =>{
    try{
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'UPDATE health_representative SET product_catalog = (?) WHERE rep_uuid = (?)'
        const values = [productCatalog, uuid]
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

export const getProductCatalog = async(uuid:string) => {
    try {
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'SELECT product_catalog FROM health_representative WHERE rep_uuid = (?)'
        const value = [uuid]
        const [result, fields] = await connection.execute(sql, value)
        console.log(result)
        console.log(fields)
        //await closeDB_Connection()
        connection.release()
        //@ts-ignore
        return result[0]
    } catch (error:any) {
        console.log(error)
        throw new Error(error.message)
    }finally{
        //await closeDB_Connection()
    }
}

export const updateProductCatalogItem = async (uuid:string) => {

}

export const getAllRepresentatives = async () => {
    try{
        const connection = await POOL.getConnection()
        const sql ='SELECT * FROM users as u JOIN health_representative as hr ON u.uuid = hr.rep_uuid'
        const [result, fields] = await connection.execute(sql)
        connection.release()
        return result
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}