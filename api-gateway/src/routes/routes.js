//--- Imports ---
import express from 'express'
import services from '../../apiRoutes.json' assert {type: "json"}
import axios from 'axios'
import loadbalancer from '../utils/loadbalancer.js'
import fs from 'fs'
import cors from 'cors'

// --- Config ---
const router = express.Router()
router.use(cors())

// --- Routes ---

router.post('/router/test', async (req,res)=>{
    
    const respuesta = await axios({
        method :"POST",
        url: 'http://localhost:8080/v1/user/login',
        data: req.body
    })
    console.log(respuesta.data)
    res.status(200).json({
        message: "Response from router",
        data: respuesta.data
    })
})
router.post('/register/endpoint', (req, res)=>{
    const registrationInfo = req.body
    console.log(registrationInfo)
    console.log(!services.endpoints[registrationInfo.apiName])
    if(services.endpoints[registrationInfo.apiName]){
        return res.status(400).json({
            message: "The endpoint already exists"
        })
    }
    services.endpoints[registrationInfo.apiName] = {
        index: 0,
        instances: [registrationInfo]
    }
    console.log(services) 
    fs.writeFile('./apiRoutes.json', JSON.stringify(services), (error) => {
        console.log('Could not register endpoint: ', registrationInfo.apiName)
        return res.status(400).json({
            message: "Could not register endpoint: " + registrationInfo.apiName
        })
    })
    return res.status(200).json({
        message: "Successfully Created Endpoint"
    })
})
router.post('/register/instance', (req, res) => {
    const registrationInfo = req.body

    if (alreadyExists(registrationInfo)) {
        return res.status(200).json({
            message: "The instance already exists"
        })
    }

    services.endpoints[registrationInfo.apiName].instances.push({ ...registrationInfo })
    fs.writeFile('./apiRoutes.json', JSON.stringify(services), (error) => {
        console.log('Could not register endpoint instance: ', registrationInfo.apiName)
        return res.status(400).json({
            message: "Could not register endpoint instance: " + registrationInfo.apiName
        })
    })

    return res.status(201).json({
        message: "Instance successfully created"
    })
})
router.post('/unregister', (req, res) => {
    const registrationInfo = req.body
    console.log(registrationInfo)
    if (alreadyExists(registrationInfo)) {
        console.log("Entered already exists if")
        const index = services.endpoints[registrationInfo.apiName].instances.findIndex((instance) => {
            console.log("Entered index if")
            return registrationInfo.url === instance.url
        })
        console.log("Index: ", index)
        services.endpoints[registrationInfo.apiName].instances.splice(index, 1)
        fs.writeFile('./apiRoutes.json', JSON.stringify(services), (error) => {
            return res.send({
                message: "Could not unregister endpoint: " + registrationInfo.apiName
            })
        })
    }

    return res.status(200).json({
        message: "Endpoint unregistered"
    })
})

router.get('/endpoints', (req, res)=>{
    let endpoints = {}
    //services.endpoints.forEach(endpoint => {return endpoint.instances})
    //console.log(endpoints)
    Object.values(services.endpoints).forEach(endpoint => {
        if(typeof endpoint === 'object' && endpoint !== null && 'instances' in endpoint){
            endpoints[endpoint.instances[0].apiName] = (endpoint.instances)
        }
    })
    console.log(endpoints)
    return res.status(200).json({endpoints})
})

router.post('/state/:apiName', (req, res) => {
    let response = ""
    const apiName = req.params.apiName
    const body = req.body
    console.log(body.url)
    const instances = services.endpoints[apiName].instances
    console.log(instances)
    const index = instances.findIndex((srv) => { return srv.url === body.url })
    if (index == -1) {
        return res.status(404).json({
            message: "Service not found"
        })
    }

    instances[index].state = req.body.state
    fs.writeFile('./apiRoutes.json', JSON.stringify(services), (error) => {
        if (!error) {
            response = "Error Encountered"
        }
        response = "Successfully Registered"
    }
    )

    response.includes("Error") ?
        res.status(400).json({
            message: "Could not update state of " + apiName + " " + instances
        })
        :
        res.status(200).json({
            message: "OK"
        })

    return res
})


router.get('/user/profilePicture', async (req,res) => {
    try{

        const response = await axios({
            url:"http://192.168.1.95:8080/v1/user/profilePicture",
            method:"GET",
            headers: req.headers,
            data:req.body,
            params:req.query,
            responseType: "stream"
        })
        res.set(response.headers)
        
        return response.data.pipe(res)
    }catch(error){
        console.log(error)
    }
})


router.all('/:apiName/:resource', async (req, res) => {
    const service = services.endpoints[req.params.apiName]
    console.log("Service: ", service)
    console.log(req.params.apiName, req.params.resource)
    console.log("URL: " + req.url)
    !services.endpoints[req.params.apiName]
    if (!service) {
        return res.status(404).json({
            resource: req.params.apiName,
            message: "The resource name does not exist in the directory"
        })
    }
    console.log(service.loadBalanceStrategy)
    if (!service.loadBalanceStrategy) {
        service.loadBalanceStrategy = 'ROUND_ROBIN'
        fs.writeFile('./apiRoutes.json', JSON.stringify(services), (error) => {
            error ? console.log(error) : console.log("Success")
        })
    }
    let data = {}

    console.log(services.endpoints[req.params.apiName].instances[0].url + req.params.resource)
    console.log(req.method)
    console.log(req.headers)
    console.log('Query: ',req.query)
    try {
        const newIndex = loadbalancer[service.loadBalanceStrategy](service)
        console.log('New Index: ', newIndex)
        const newURL = service.instances[newIndex].url
        console.log("New URL: ", newURL , ' ',req.params.resource)
        console.log('Body: ', req.body)
        console.log('Params: ', req.query)
        const result = await axios({
            method: req.method,
            //services.endpoints[req.params.apiName][0].url + req.params.resource,
            url: newURL + req.params.resource,
            headers: {
                'Content-Type':req.headers['content-type'],
                'Authorization': req.headers['authorization'],
                'Host': req.headers['host'],
                'Token' : req.headers['token'],
                'Refresher': req.headers['refresher'],
            },
            params: req.query,
            data: req.body,
        })
        //console.log('Result',result.data)
        if (!result.body) {
            //console.log('Assigning data')
            //console.log(data)
            data = result.data
            //console.log(data)
        }
        if (!data) {
            return res.status(500).json({
                error:"Gateway Payload",
                message: "Payload empty"
            })
        }
    } catch (error) {
        console.log(error.response?.data.message)
        return res.status(400).json(error.response?.data)
    }
    console.log("Payload Data",data)
    return res.status(200).json(data)
})


// --- Utilities ---
const alreadyExists = (registrationInfo) => {
    let exist = false
    //console.log(registrationInfo.apiName)
    services.endpoints[registrationInfo.apiName].instances.forEach(instance => {
        if (instance.url === registrationInfo.url) {
            exist = true
        }
    });
    return exist
}


//TODO: Replace all fs.writeFile for a unified function
const updateJSON = (info) => {
    let response

    switch (info.type) {
        case "Register":
            break;
        case "Unregister":
            break;
        case "LoadBalance":
            break;
    }

    fs.writeFile('./apiRoutes.json', JSON.stringify(services), (error) => {
        response = error ? "Error Encountered" : "Successfully Registered"
    })

    response.includes('Error') ? res.status(400).json({
        type: "Error",
        message: response,
        description: info.description
    })
        :
        res.status(200).json({
            type: "Success",
            message: response,
            description: info.description
        })

    return res
}


export default router