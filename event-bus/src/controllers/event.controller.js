// --- Imports ---
import axios from 'axios'
import fs from 'fs'
import { storeEvent, getEvents } from '../utils/DAO.js'
import broadcast from '../../listeners.json' assert {type: "json"}

// --- CONST ---
const AUTH_USER = Buffer.from('test:pwd', 'utf8').toString('base64')
const events = []

// --- Controllers ---
export const postEventHandler = async (req, res) => {
    // Update my events
    // 1-Receive Event
    // 2-Store the event
    // 3- Emite new event to all listeners

    const content = req.body
    console.log(content)
    events.push(content)
    const uuid = await storeEvent(content)

    try {

        Object.keys(broadcast.endpoints).forEach((key) => {
            const endpointsArray = broadcast.endpoints[key];

            endpointsArray.forEach((endpoint) => {
                endpoint.state ?
                    axios({
                        method: "POST",
                        url: endpoint.url + "events",
                        data: {
                            eventUUID: uuid,
                            content: req.body
                        }
                    })
                    :
                    console.log(endpoint.url, " not available")
            })
        })

    } catch (error) {
        console.log(error)
    }
    return res.status(200).json({
        message: "Successfully created event"
    })
}

export const getEventsHandler = async (req, res) => {
    //Give events
    // 1-Emit stored event to all listeners
    //const events = await getEvents()
    //console.log(broadcast.endpoints)
    Object.keys(broadcast.endpoints).forEach((key) => {
        const endpointsArray = broadcast.endpoints[key];

        endpointsArray.forEach((endpoint) => {
            endpoint.state ?
                axios({
                    method: "POST",
                    url: endpoint.url + "events"

                })
                :
                console.log(false)
        })
    })
    res.json({
        message: "Ok",
        events: events
    })
}

export const listeners = (req, res) => {
    //Update list of listeners

}