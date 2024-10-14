import { Pool, createPool } from 'mysql2/promise';

export let POOL: Pool

export const openDB_Pool = async () => {
    POOL = createPool({
        host: process.env.PREMED_HOST,
        user: process.env.PREMED_USER,
        password: process.env.PREMED_PWD,
        database: process.env.PREMED_DB,
        dateStrings:['DATE', 'DATETIME'],
        connectionLimit: 20,
        maxIdle:1,
        idleTimeout:1000,
        connectTimeout: 10000
    });
}

export const closeDB_Pool = async () =>{
    await POOL.end()
}