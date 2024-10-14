import express from "express";
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import axios from "axios"
import http from 'http'
import {Server} from 'socket.io'


//import { initializeService } from "./src/utils/DAO/dao.utils.ts";
import { openDB_Pool } from "./src/utils/DAO/dao.config.ts";
import { router } from "./src/routes/routes.ts";
import { handleMessagetoRoom } from "./src/controllers/chat.controller.ts";
import { Message } from "./src/models/message.model.ts";



dotenv.config()
const PROTOCOL = process.env.PROTOCOL
const HOST = process.env.HOST
const PORT = process.env.PORT
const AUTH_USER = process.env.AUTHORIZATION
const API_NAME = process.env.API_NAME


const app = express()
app.use(express.json())
app.use(cors())
app.use(helmet())

app.use('/', router)

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET","POST"]
    }
})

io.on("connection", (socket) => {
    console.log(`Usuario actual: ${socket.id}`)

    socket.on("join_room", (data) => {
        socket.join(data)
        console.log(`Usuario: ${socket.id} se unio a la sala: ${data}`)

    })

    socket.on("send_message", (data) => {
        console.log("data: ", data)
        handleMessagetoRoom(data as Message)
        socket.to(data.session_id).emit("receive_message", data)
    })

    socket.on("disconnect", () => {
        console.log("usuario desconectado", socket.id)
    })
})

    

server.listen(PORT, async () => {
    await openDB_Pool()
    const credentials = AUTH_USER as string
    const authString = Buffer.from(credentials, 'utf8').toString('base64')
    try {
        //await initializeService()
    } catch (error) {
        console.log(error)
        return
    }
    try {
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
                "url": `${PROTOCOL}${HOST}:${PORT}/v1/chat/`,
                "state": true
            }
        })
        console.log(res.data.message)
    } catch (error: any) {
        console.log(error.response.data.message)
    }
    console.log(`App listening on port ${PORT}`)
})