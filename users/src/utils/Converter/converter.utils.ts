import { Request, Response, NextFunction } from 'express'
//@ts-ignore
import webp from 'webp-converter'
import { createRecoveryCode } from '../Encryption/EncryptionHandler'

export const handleImageConverter = async (req: Request, res: Response, next: NextFunction) => {
    const { uuid, mimeType } = req.query
    console.log(uuid)

    try {

        const result = await webp.cwebp(
            `C://Users//hp//Desktop//Avatars//${uuid}//profilePicture-${uuid}.${mimeType}`,
            `C://Users//hp//Desktop//Avatars//${uuid}//profilePicture-${uuid}.webp`,
            "-q 80",
            "-v"
        );
        console.log(result)
        req.query.url = `http://192.168.1.178:8080/v1/user/profilePicture?uuid=${uuid}&rand=${createRecoveryCode()}`
        next()
    }catch(error:any){
        console.log(error)
        return res.status(500).json({
            error: "File Converter",
            message: error.message
        })
    }
}