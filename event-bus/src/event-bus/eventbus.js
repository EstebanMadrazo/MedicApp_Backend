import express from 'express'
import { getEventsHandler, listeners, postEventHandler, } from '../controllers/event.controller.js'

const eventbus = express.Router()


eventbus.post('/events', postEventHandler)
eventbus.get('/events', getEventsHandler)
eventbus.post('/listeners', listeners)

export default eventbus