import { getPayloadUser } from "./src/controllers/token.controller.js"
import { getUUIDByUser, validateCredentials } from "./src/utils/DAO/DAO.js"
import { hashPassword } from "./src/utils/encryption/encryption.js"


function generateSecrets(iterations){
    let secret = "PREMED_REFRESH_TOKEN"

    for(let i = 0; i<iterations; i++){
        secret = Buffer.from(secret, 'utf8').toString('base64')
    }

    console.log(secret)
}

//generateSecrets(10)
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InN1YiI6ImRHVnpkRUIwWlhOMExtTnZiUT09IiwicmVmcmVzaGVkIjp0cnVlfSwiaWF0IjoxNzA4NDU2NDY4LCJleHAiOjE3MDg0NTY0ODN9.n8jQvYbj9uvx-yBvUOZGyLCFpH4uWkFBndQFCwhdci8'
//getPayloadUser(token)
//const result = await getUUIDByUser('test@test.com')
//console.log(result[0].uuid)
//console.log(hashPassword('pwd123'))
validateCredentials('test@test','pwd123')