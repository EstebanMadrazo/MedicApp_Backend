import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import axios from 'axios'
import eventbus from './src/event-bus/eventbus.js'
import fs from 'fs'
import { openDBConnection } from './src/utils/DAO.js'


const app = express()
const PORT = 3001
const AUTH_USER = Buffer.from('test:pwd','utf8').toString('base64')

app.use(express.json())
app.use(helmet())
app.use(cors())
app.use('/', eventbus)

const createListeners = (listeners)=>{
    fs.writeFile('./listeners.json', JSON.stringify(listeners), (error)=>{
        if(error){
            console.log(error)
        }else{
            console.log("File successfully created")
        }
    })
}

app.listen(PORT, async()=>{
    try{
        await openDBConnection()
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:3000/endpoints',
            headers: {
                "Content-Type" : "application/json",
                "Authorization": AUTH_USER
            }      
        })
        console.log(res.data)
        createListeners(res.data)

    }catch(error){
        console.log(error)
    }
    console.log(`Event bus running on ${PORT}`)
})