// ---Imports---
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import axios from 'axios'
import cors from 'cors'
import router from './src/router/router.js'
import { initializeService, openDB_Connection } from './src/utils/DAO/DAO.js'

// ---ENVS---
dotenv.config()
const app = express()
const PORT = process.env.PORT
const AUTH_USER = process.env.AUTH_USER
const PROTOCOL = process.env.PROTOCOL
const HOST = process.env.HOST

// ---Configs---
app.use(express.json())
app.use(helmet())
app.use(cors())

// ---Routes Entry Point---
app.use('/', router)

app.listen(PORT, async () => {
    const credentials = AUTH_USER
    const authString = Buffer.from(credentials, 'utf8').toString('base64')

    //-- Delete if doesnt work --
    try{
        await initializeService()
    }catch(error){
        console.log(error)
        return
    }

    try {
        await openDB_Connection()
        const res = await axios({
            method:'POST',
            url:'http://localhost:3000/register/instance',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': authString
            },
            data:{
                "apiName" : 'auth',
                "protocol": PROTOCOL,
                "host": HOST,
                "port": PORT,
                "url": `${PROTOCOL}${HOST}:${PORT}/v1/auth/`,
                "state": true
            }
        })
        console.log(res.data.message)
    } catch (error) {
        console.log(error)
    }
    console.log(`App listening on port: ${PORT}`)
})