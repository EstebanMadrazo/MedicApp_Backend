import express from 'express'
import helmet from 'helmet'
import router from './src/routes/routes.js'
import services from './apiRoutes.json' assert {type: 'json'}
import cors from 'cors'

const app = express()
const PORT = 3000
app.use(express.json())
//app.use(helmet())
app.use(cors())

const auth = (req,res,next) =>{
    
    const url = req.protocol + '://' + req.hostname + ':' +PORT + req.path
    console.log(req.headers.authorization)
    if(!req.headers.authorization){
        return res.status(403).json({
            error: "Client credentials not found",
            description: "Client authentication failed"
        })
    }
    const authString = Buffer.from(req.headers.authorization, 'base64').toString('utf8')
    const authParts = authString.split(':')
    const username = authParts[0]
    const password = authParts[1]
    console.log(username,':',password)
    const user = services.auth.users[username]
    if(!user){
        return res.status(404)
    }

    if(user.username !== username || user.password !== password){
        return res.status(403).json({
            authenticated: false,
            path: url,
            message: "Username or password doesn't match"
        })
    }

    next()
}
app.get('/test', (req,res)=>{
    res.status(200).json({
        meesage: "Response from gateway"
    })
})
//app.use(auth)
app.use('/', router)

app.listen(PORT,()=>{
    console.log(`Gateway listening on port ${PORT}`)
})