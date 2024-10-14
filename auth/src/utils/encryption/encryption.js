import crypto from 'crypto'

export const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex')
}

export const comparePasswords = (pwd1, pwd2) => {
    console.log('PWD1 type: ', typeof pwd1)
    console.log('PWD2 type: ', typeof pwd2)
    return (pwd1.localeCompare(pwd2) === 0 ) ? true: false
}

export const generateUUID = ()=>{
    return crypto.randomUUID()
}