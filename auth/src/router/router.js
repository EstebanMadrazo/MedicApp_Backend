// ---Imports---
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { login, logout } from '../controllers/login.controller.js'
import { refreshToken, verifyHandler } from '../controllers/token.controller.js'
import { eventHandler } from '../controllers/event.controller.js'

// ---ENVS---
dotenv.config()
const SECRET = process.env.SECRET


// --- Configs ---
const router = express.Router()
router.use(express.json())
router.use(cors())

/*
    For these routes I'll probably have to implement the middleware to validate the jwt
    I'll need to store the jwt_refresher in database, aswell as user id corresponding to that user

    jwt refresher body: {
        user_uuid,
        iat,
        refreshed?
    }

    Workflow
    1.- Receive auth token
    2.- If(token is expired)
    3.- Check for refresh token
    4.- If (refreshToken.verify is successful)
    5.- Generate a new auth token and return it in response
    6.- If (resource is sensitive)
    7.- Check if the token was refreshed before
    8.- If (token was refreshed)
    9.- Delete refresh token and Prompt user for credentials again
    10.- Generate a new refresh token
*/

router.post('/v1/auth/login', login)
//router.post('/v1/auth/register', register)
router.delete('/v1/auth/logout', logout)
router.get('/v1/auth/test', refreshToken)
router.post('/v1/auth/verify', verifyHandler)
router.post('/v1/auth/events', eventHandler)
router.get('/v1/auth/testing', (req,res)=>{
    return res.status(200).json({
        message:"It's working"
    })
})


export default router