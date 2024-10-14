import { Pool, createPool } from 'mysql2/promise';

export let POOL: Pool

export const openDB_Pool = async () => {
    POOL = createPool({
        host: process.env.PREMED_HOST,
        user: process.env.PREMED_USER,
        password: process.env.PREMED_PWD,
        database: process.env.PREMED_DB,
        connectionLimit: 20,
        connectTimeout: 10000
    });
}

export const closeDB_Pool = async () =>{
    await POOL.end()
}

export const storePayment = async (payment:object) => {
    try{
        const sql = 'INSERT INTO test (data) values (?)'
        const value = [payment]
        const [result,fields] = await POOL.execute(sql, value) 
        console.log(result)
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}