import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const SECRET = process.env.SECRET
const REFRESHER = process.env.REFRESH

export const createExpirableToken = (encoded, refreshed) => {
    const token = jwt.sign({
        data: {
            sub: encoded,
            refreshed: refreshed
        },
    }, SECRET/*, { expiresIn: '30m' }*/)

    return token
}

export const createRefresherToken = (encoded) => {
    const token = jwt.sign({
        data: {
            sub: encoded
        },
    }, REFRESHER/*, { expiresIn: '24h' }*/)

    return token
}

export const refreshToken = (req, res) => {
    const { authorization, refresher } = req.headers
    const authToken = authorization.split(' ')
    const refreshToken = refresher.split(' ')
    const resultAuth = verifyToken(authToken[1], 'Refreshable')
    const resultRefresh = verifyToken(refreshToken[1], 'Refresher')

    if (typeof resultRefresh !== typeof {}) {
        return res.status(400).json({
            error: "Refresh Token",
            message: resultRefresh
        })
    }
    console.log(resultAuth)
    if (resultAuth !== 'jwt expired') {
        return res.status(400).json({
            error: "Auth Token",
            message: resultAuth
        })
    }
    const jwtParts = authToken[1].split('.')
    //console.log(jwtParts[1])
    const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString('utf8'))
    const newToken = createExpirableToken(payload.data.sub, true)
    //console.log(newToken)

    /*try{
        const verify = jwt.verify(tokenParts[1], SECRET)
        console.log(verify)

    }catch(error){
        //console.log(error.message)
        err = error.message
    }
    console.log(err)
    if(err === 'jwt expired'){
        const jwtParts = tokenParts[1].split('.')
        console.log(jwtParts[1])
        const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString('utf8'))
        console.log(payload.data.sub)

        const refresherBearer = req.headers['refresher']
        const refresher = refresherBearer.split(' ')
        try{
            const verify = jwt.verify(refresher[1], REFRESHER)
        }catch(error){
            return res.status(500).json({
                error: 'Refresher Token Error',
                message: error.message
            })
        }
        
        
        return res.status(403).json({
            error: err,
            payload: payload,
        })
    }*/

    return res.status(200).json({
        message: "Token Created",
        token: newToken
    })

}

export const verifyHandler = (req, res) => {
    const { token } = req.body
    console.log(token)
    const tokenParts = token?.split(' ')
    const response = verifyToken(tokenParts[1], "Refreshable")
    const payload = getPayloadUser(token)
    console.log(response)
    response.status === 'Valid' ? res.status(200).json({ status: "Valid", payload: payload }) : res.status(500).json({ status: "Not Valid" })
    console.log(response.status)
    return res
}

const verifyToken = (token, type) => {
    let content
    const secret = (type === 'Refreshable') ? SECRET : REFRESHER
    try {
        content = jwt.verify(token, secret)
    } catch (error) {
        return error.message
    }

    return {
        status: "Valid",
        content: content
    }
}

const getPayloadUser = (token) => {
    const data = token.split(' ')
    const tokenParts = data[1].split('.')
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf8'))
    const user = Buffer.from(payload.data.sub, 'base64').toString('utf8')
    console.log(user)
    return user
}