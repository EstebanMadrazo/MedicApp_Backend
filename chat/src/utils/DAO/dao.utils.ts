import { FieldPacket, RowDataPacket } from 'mysql2';
import { Message } from '../../models/message.model.ts';
import { Room } from '../../models/room.model.ts';
import { POOL } from './dao.config.ts';


export const storeMessageInDB = async (message: Message) => {

    console.log("Estoy en STORE-MESSAGE")
    let sent_at = formatDate(message.sent_at)

    console.log(message.sent_at)
    console.log(sent_at)

    try{
        const connection = await POOL.getConnection()
        const sql = 'INSERT INTO messages (sender, session_id, sent_at, content) VALUES (?,?,?,?)'
        const values = [
            message.sender,
            message.session_id,
            sent_at,
            message.content
        ]

        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        console.log(fields)
        connection.release()
    }catch(error:any){
        console.log(error)
        throw new Error(error)
    }finally{
    }
}

const formatDate = (date :Date): String =>{
    const auxDate = new Date(date).toISOString()
    return auxDate.replace('T', ' ').replace('Z', '')
}

export const storeMRoomInDB = async (room: Room) => {
    console.log(room)

    let created_at = formatDate(room.getCreated_at())
    let expires_at = formatDate(room.getExpires_at())


    try{
        const connection = await POOL.getConnection()
        const sql = 'INSERT INTO rooms (session_id, pacient_uuid, hp_uuid, created_at, expires_at, is_expired) VALUES (?,?,?,?,?,?)'
        const values = [
            room.getSession_id(),
            room.getPacient_uuid(),
            room.getHp_uuid(),
            created_at,
            expires_at,
            room.getIsExpired()
        ]

        const [result, fields] = await connection.execute(sql, values)
        console.log(result)
        console.log(fields)
        connection.release()
    }catch(error:any){
        console.log(error)
        throw new Error(error)
    }finally{
    }
}

export const getMessagesbySession_id = async(session_id: string) => {
    //await openDB_Connection()
    try{
        const connection = await POOL.getConnection()
        const sql = `
            SELECT m.id, m.sender, m.sent_at, m.content
            FROM messages AS m
            INNER JOIN rooms AS r ON m.session_id = r.session_id
            WHERE r.session_id = (?);
            `;
        const value = [session_id]

        const [result, fields]: [RowDataPacket[],FieldPacket[]] = await connection.execute(sql, value)
        //console.log(result)
        //console.log(fields)
        connection.release()
        return result as unknown as Message[]
    }catch(error:any){
        console.log(error)
    }finally{
    }
}



