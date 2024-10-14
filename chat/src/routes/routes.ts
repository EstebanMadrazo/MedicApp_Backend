import express from "express";
import { handleAllMessageFromRoom, handleRoom } from "../controllers/chat.controller";

export const router = express.Router()

router.post('/v1/chat/events', (req,res) => {
    return res.status(200).json({message:"OK"})
})

router.post('/v1/chat/storeRoom', handleRoom)
router.get('/v1/chat/getAllMessages', handleAllMessageFromRoom)