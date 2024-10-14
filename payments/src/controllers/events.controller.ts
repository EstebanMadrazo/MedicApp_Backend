import { Handler, Request, Response } from "express";

export const eventHandler:Handler = (req:Request, res:Response) => {
    console.log(req.body)
    return res.status(200).json({message:"OK"})
}