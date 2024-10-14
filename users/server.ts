// ---Package Imports---
import axios from 'axios'
import express from 'express'
import env from 'dotenv'
import cors from 'cors'
import { router } from './src/routes/user.routes'
import path from 'path'
import { closeDB_Pool, openDB_Pool } from './src/utils/DAO/DAO.ts'
// ---ENVS---
env.config()
const app = express()
const PROTOCOL = process.env.PROTOCOL
const HOST = process.env.HOST
const PORT = process.env.PORT
const AUTH_USER = process.env.AUTHORIZATION


// ---Server Configs---
app.use(express.json())
app.use(cors())

// ---Endpoints---
app.use(express.static('src/utils/MailTemplate'));
app.use('/', router)

app.listen(PORT, async () => {
    await openDB_Pool()
    const credentials = AUTH_USER as string
    const authString = Buffer.from(credentials, 'utf8').toString('base64')

    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/register/instance',
            headers: {
                'Content-Type': 'application/json',
                'authorization': authString
            },
            data: {
                "apiName": "user",
                "protocol": PROTOCOL,
                "host": HOST,
                "port": PORT,
                "url": `${PROTOCOL}${HOST}:${PORT}/v1/user/`,
                "state": true
            }
        })
        console.log(res.data.message)
    } catch (error: any) {
        console.log(error.message)
    }
    console.log(`App listening on port ${PORT}`)
})

process.on('SIGTERM', ()=>{
    console.log('Server Closing')
    closeDB_Pool()
})