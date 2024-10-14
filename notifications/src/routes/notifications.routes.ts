import {Router} from 'express'

export const router = Router()

router.get('/', (req:any, res:any)=>{
    return res.status(200).json({message: "OK"})
})

router.post('/v1/notifications/events', (req:any, res:any) => {
    console.log('Event: ',req.body)
    return res.status(200).json({message: 'OK'})
})