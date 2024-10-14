import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import {config} from 'dotenv'
import axios from 'axios'
import { router } from './src/routes/notifications.routes.ts'

config()
const PROTOCOL = process.env.PROTOCOL;
const HOST = process.env.HOST;
const PORT = process.env.PORT;
const AUTH_USER = process.env.AUTHORIZATION;
const API_NAME = process.env.API_NAME;

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/',router);

app.listen(PORT, async ()=> {
    //await openDB_Pool();
    const credentials = AUTH_USER as string;
    const authString = Buffer.from(credentials, 'utf8').toString('base64');
    try{
        //await initializeService()
    }catch(error){
        console.log(error);
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
                "url": `${PROTOCOL}${HOST}:${PORT}/v1/${API_NAME}/`,
                "state": true
            }
        })
        console.log(res.data.message)
    } catch (error: any) {
        console.log(error.response.data.message)
    }
    console.log(`App listening on port ${PORT}`)
})