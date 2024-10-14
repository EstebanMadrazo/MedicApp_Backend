import { createExpirableToken, createRefresherToken } from './token.controller.js'
import { findToken, getUUIDByUser, removeToken, setFirstLogin, storeTokenInDB, validateCredentials } from '../utils/DAO/DAO.js'
import { createEvent } from './event.controller.js'
import { EVENT_TYPE } from '../utils/EventTypes/EventTypes.utils.js'
import { comparePasswords, hashPassword } from '../utils/encryption/encryption.js'

export const login = async (req, res) => {
  const { account, password } = req.body.data
  console.log(account, password)
  if (!account || !password) {
    return res.status(500).json({
      error: "Invalid Credentials",
      message: "Please provide username and password"
    })
  }

  try {
    const user = await validateCredentials(account, password)

    if(!comparePasswords(hashPassword(password).toString(), user[0].password)){
      return res.status(500).json({
        error: "Invalid Credentials",
        message: "Username or Password does not match"
      })
    }

    if (user[0].is_access_restricted) {
      return res.status(500).json({
        error:"User Restricted",
        message: "The user has been restricted to access the system"
      })
    }
    if(user[0].is_deleted){
      return res.status(500).json({
        error:"User Deleted",
        message: "The account has been deleted from the system"
      })
    }
  } catch (error) {
    return res.status(400).json({
      error: "Invalid Credentials",
      message: error.message
    })
  }

  const encoded = Buffer.from(account, 'utf8').toString('base64')
  //const decoded = Buffer.from(encoded, 'base64').toString('utf8')

  //console.log(encoded, decoded)
  const token = createExpirableToken(encoded)
  const refresh = createRefresherToken(encoded)

  const store = {
    user: account,
    refreshToken: refresh
  }

  try {
    await storeTokenInDB(store)

  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: error.message
    })
  }
    const user = await getUUIDByUser(account)
    console.log(user)
    const event = {
      eventType: EVENT_TYPE.LOGIN,
      content:{
        uuid: user[0].uuid,
        timestamp: Date()
      }
    }
    console.log(event)
    createEvent(event)
  return res.status(200).json({
    message: "Login Success",
    uuid: user[0].uuid,
    userRole: user[0].role,
    account: user[0].email,
    firstLogin: user[0].is_first_login,
    token: token,
    refreshToken: refresh
  })
}

export const logout = async (req, res) => {
  const refresher = req.headers['refresher']
  console.log('Refresher', refresher)
  const token = refresher.split(' ')
  const tokenParts = token[1]
  console.log('Token: ', tokenParts)
  try{

    const result = await findToken(tokenParts)
    if(typeof result !== typeof []){
      return res.status(404).json({
        error: result,
        message: 'The token provided does not exists in the current db context'
      })
    }
    const removed = await removeToken(result[0].user_token)
    console.log(removed)
    console.log(result)
    
    return res.status(200).json({
      message: "Logout Success"
    })
  }catch(error){
    return res.status(404).json(error)
  }
}
