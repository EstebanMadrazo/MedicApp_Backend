import mysql from 'mysql2/promise';
import * as env from 'dotenv'
env.config()
console.log(process.env.PREMED_DB)

let con
try{
    con = await mysql.createConnection({
        host: process.env.PREMED_HOST,
        user: process.env.PREMED_USER,
        password: process.env.PREMED_PWD,
        database: process.env.PREMED_DB 
        
    })
    const sql = ('INSERT INTO users (phone_number, given_name, family_name, role, email, password, birthdate) VALUES (?,?,?,?,?,?,?)')
    const values = ['0123456789','Dummy','Dummynson','Admin','dummy@test.com','mysupersecurepassword','2024-01-23']

    const [result, fields] = await con.execute(sql,values)

    console.log(result)
    console.log(fields)
}catch(error){
    console.log(error)
}finally{
    con.end()
}