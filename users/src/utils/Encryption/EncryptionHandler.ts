import crypto from 'crypto'

export const hashPassword = (password: string) => {
    return crypto.createHash('sha256').update(password).digest('hex')
}

export const comparePasswords = (pwd1: string, pwd2: string): Boolean =>{
    return (pwd1.localeCompare(pwd2)) == 0 ? true : false
}

export const createUUID = ()=>{
    return crypto.randomUUID()
}

export const createRecoveryCode = () => {
    let code = ''
    const numbers = [0,1,2,3,4,5,6,7,8,9]
    const size = 6
    for(let i = 0; i< size; i++){
        code += numbers.at(Math.floor(Math.random() * size));
    }
    return code
}

//module.exports = { hashPassword, comparePasswords }
