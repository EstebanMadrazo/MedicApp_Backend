import { Handler, Request, Response } from "express"
import { getMessagesbySession_id, storeMRoomInDB, storeMessageInDB } from '../utils/DAO/dao.utils'
import { Message } from '../models/message.model'
import { Room } from '../models/room.model'

export const handleMessagetoRoom = async (message: Message)  => {
    console.log(message)
    if (!message) {
        return {error: "Message not exist", 
        message: "No data for sending was found in the message body"}
    }
    try {
        await storeMessageInDB(message)
    } catch (error) {
        console.log(error)
    }
}

export const handleRoom: Handler = async (req: Request, res: Response) => {
    // valid account
    const data = req.body
    console.log(data)
    if(!data){
        return res.status(400).json({
            error: "Data not exist to Room",
            message: 'No Room object found'
        })
    }
    var room = new Room
    room.createRoom(data)
    try {
        storeMRoomInDB(room)
        return res.status(201).json({
            message: `Successfully stored comment in appointment ${room.getSession_id()}`
        })
    } catch (error: any) {
        return res.status(500).json({
            error: "Room Store in DB",
            message: error.message
        })
    }

}

export const handleAllMessageFromRoom: Handler = async (req: Request, res: Response) => {
    const {uuid} = req.query
    console.log(uuid)
    if(!uuid){
        return res.status(400).json({
            error: "UUID not exist",
            message: 'No UUID found'
        })
    }

    try {
        const messages = await getMessagesbySession_id(uuid as string)
        return res.status(200).json(messages)
    } catch (error: any) {
        return res.status(500).json({
            error: "Get Messages in DB",
            message: error.message
        })
    }
}




