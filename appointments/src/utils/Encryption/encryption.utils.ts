import crypto from 'crypto'

export const createUUID = ():string =>{
    return crypto.randomUUID()
}

export const createVerificationCode = () => {
    let code = ''
    const numbers = [0,1,2,3,4,5,6,7,8,9]
    const size = 6
    for(let i = 0; i< size; i++){
        code += numbers.at(Math.floor(Math.random() * size));
    }
    return code
}