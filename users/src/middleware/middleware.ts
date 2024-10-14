import { NextFunction, Request, Response } from "express"
import axios from "axios"

export const validateAuthorization = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']
    const refresher = req.headers['refresher']
    console.log("Token",token)
    console.log("Refresher",refresher)
    if (!token) {
        return res.status(400).json({
            error: "Token Validation",
            message: "Unauthorized auth token not provided"
        })
    }
    if (!refresher) {
        return res.status(400).json({
            error:"Token Validation",
            message: "Unauthorized refresh token not provided"
        })
    }
    try {
        const response = await axios({
            method: 'POST',
            url: 'http://localhost:3000/auth/verify',
            data: {
                token: token
            }
        })
        req.headers.isValidToken = response.data.status
        req.body.payload = response.data.payload
        next()
    } catch (error: any) {
        console.log(error.message)
        return res.status(400).json({
            error: "Authorization Middleware",
            message: "Error validating token"
        })
    }
}