import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import axios from 'axios'
import { router } from './src/routes/payments.routes'
import { openDB_Pool } from './src/utils/dao/dao.utils'
import path from 'path'

dotenv.config()
const app = express()
const API_NAME = process.env.API_NAME
const PROTOCOL = process.env.PROTOCOL
const HOST = process.env.HOST
const PORT = process.env.PORT
const AUTH_USER = process.env.AUTHORIZATION
export const ROOT = path.join(__dirname)
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(express.static('src/utils/statics'))

app.use('/', router)

app.listen(PORT, async()=>{
    const credentials = AUTH_USER as string
    const authString = Buffer.from(credentials, 'utf8').toString('base64')

    try {
        await openDB_Pool()
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/register/instance',
            headers: {
                'Content-Type': 'application/json',
                'authorization': authString
            },
            data: {
                "apiName": API_NAME,
                "protocol": PROTOCOL,
                "host": HOST,
                "port": PORT,
                "url": `${PROTOCOL}${HOST}:${PORT}/v1/payments/`,
                "state": true
            }
        })
        console.log(res.data.message)
    } catch (error: any) {
        console.log(error.message)
    }
    console.log(`App listening on port ${PORT}`)
})