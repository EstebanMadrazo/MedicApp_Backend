import { Request, Response, NextFunction } from 'express'
import multer from "multer"
import fs from "node:fs"
const baseUrl = `C:/Users/hp/Desktop/Avatars`

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        console.log("Params middleware: ", req.query)
        createFolder(req.query.uuid as string)
        callback(null, `${baseUrl}/${req.query.uuid}`)
    },
    filename: function (req, file, callback) {
        console.log(req.body.query)
        console.log("Params middleware: ", req.query)
        console.log('File: ', file)
        const uniqueSufix = req.query.uuid
        //const uniqueSufix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const mimeType = file.mimetype
        const fileExtension = mimeType.split('/')
        if (fileExtension[0] === 'image') {
            console.log('MimeType:', fileExtension[1])
            req.query.mimeType = fileExtension[1]
        }
        callback(null, `${file.fieldname}-${uniqueSufix}.${fileExtension[1]}`)
    },
})
const upload = multer({ storage: storage, limits: { fileSize: 5242880 } })

export const uploadHandler = (req: Request, res: Response, next: NextFunction) => {
    upload.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'professionalID', maxCount: 1 },
        { name: 'professionalTitle', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ])(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return next(err);
        } else if (err) {
            // An unknown error occurred when uploading.
            return next(err);
        }
        // Everything went fine.
        next();
    });

}

const createFolder = async (folderName: string) => {
    try {
        if (!fs.existsSync(`${baseUrl}/${folderName}`)) {
            fs.mkdirSync(`${baseUrl}/${folderName}`)
        }
    } catch (error: any) {
        console.log(error)
    }
}