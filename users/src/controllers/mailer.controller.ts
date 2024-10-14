import { Handler, Request, Response } from "express";
import AdmZip from "adm-zip";
import fs from 'fs/promises'
import nodemailer from 'nodemailer'
import path from 'path'
import { USERNAME, PASS, MAIL_HOST, MAIL_TARGET, MAIL_PORT } from "../utils/MailTemplate/config.mail";
import { createRecoveryCode } from "../utils/Encryption/EncryptionHandler";

export const handleMailer: Handler = async (req: Request, res: Response) => {
    console.log('Response after middleware: ', req.query.uuid)
    console.log('Query UUID = ', req.query)

    /**
     * Create the function to get all the files from the folder named after the req.query.uuid field
     * Send those files with node mailer to the admin mail
     */

    try {
        const path = req.query.uuid as string
        console.log(path)
        const resultFilePath = await compressFilesToZIP(path, 'C:/Users/hp/Desktop/Avatars/' + path)
        await sendEmail(path)
        console.log("Response at ", new Date())
        return res.status(201).json({ message: `Created File at ${resultFilePath}` })
    } catch (err: any) {
        console.log(err.message)
        return res.status(400).json({
            error: err,
            message: err.message
        })
    }
}

export const handlePasswordRecoveryMail = async (email:string, code:string) =>{
    const transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: true, 
        auth: {
          user: USERNAME,
          pass: PASS,
        },
      });
      try {
        const mail = await transporter.sendMail({
        from: `Administracion PREMED ${USERNAME}`,
        to: MAIL_TARGET,
        subject: `Codigo de recuperación`,
        attachments:[
            {
                filename:'premed-logo.png',
                path: path.resolve('src/utils/MailTemplate/logo-premed.png'),
                cid: 'logo'
            }
        ],
        html: recoveryEmail(code)
    });
    
    console.log("Message sent:", mail.messageId);
  } catch (error:any){
    console.log(error)
    throw new Error("No se pudo enviar el codigo de recuperacion")
  }
}

const compressFilesToZIP = async (folderPath: string, outputPath: string) => {
    console.log('Output path: ', outputPath)
    try {

        const path = 'C:/Users/hp/Desktop/Avatars/' + folderPath
        const zip = new AdmZip()
        const result = await fs.readdir(path)
        result.forEach(element => {
            if (element.includes('.pdf')) {
                const filePath = path + '/' + element
                zip.addLocalFile(filePath)
            }
        })
        const outputFile = outputPath + `/${folderPath}-documents.zip`
        zip.writeZip(outputFile)
        console.log(result)
        return outputFile
    } catch (error: any) {
        console.log(error)
        throw new Error(error)
    }

}

const sendEmail = async (uuid:string) => {
    
    
    console.log(USERNAME, PASS)

    //const pathToFile = path.resolve('src/utils/MailTemplate/template.html')
    //const template = await fs.readFile(pathToFile)
    const baseZipPath = 'C:/Users/hp/Desktop/Avatars'

    const transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: true, 
        auth: {
          user: USERNAME,
          pass: PASS,
        },
      });
      
      try {
        const mail = await transporter.sendMail({
        from: `Administracion PREMED ${USERNAME}`,
        to: MAIL_TARGET,
        subject: `Nuevo registro de Medico ${uuid}`,
        attachments:[
            {
                filename:'premed-logo.png',
                path: path.resolve('src/utils/MailTemplate/logo-premed.png'),
                cid: 'logo'
            },
            {
                filename:`${uuid}-documents.zip`,
                path: `${baseZipPath}/${uuid}/${uuid}-documents.zip`
            }
        ],
        html: email(uuid)
    });
    
    console.log("Message sent:", mail.messageId);
  } catch (error:any){
    console.log(error)
    throw new Error("No se pudieron enviar los archivos, por favor contacte a soporte@premed.com")
  }
}

const email = (uuid:string): string => {
    const logoPath = path.resolve('src/utils/MailTemplate/logo-premed.png')
    console.log(logoPath)
    const template = `<!DOCTYPE html>
    <html>
    <head>
        <title>Nuevo Registro Medico</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table cellpadding="0" cellspacing="0" width="600" style="background-color: #d0e5ff; border: 1px solid #dddddd; border-radius: 5px;">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <img src="cid:logo" alt="PREMED Logo" style="max-width: 155px; height: 90px;">
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">UUID: ${uuid}</h1>
                                <p style="color: #666666; font-size: 16px; line-height: 24px; text-wrap: balance;">
                                    Favor de <span style="font-weight: bold;">revisar los archivos adjuntos</span> en donde se encuentra la informacion detallada del médico.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <a href="https://google.com" style="background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-size: 16px;">Dar de Alta</a>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px 0; color: #666666; font-size: 12px; font-style: italic;">
                                &copy; ${new Date().getUTCFullYear()} PREMED. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`

    return template
}
const recoveryEmail = (code: string): string => {
    const logoPath = path.resolve('src/utils/MailTemplate/logo-premed.png')
    console.log(logoPath)
    const template = `<!DOCTYPE html>
    <html>
    <head>
        <title>Recuperacion de Contraseña</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table cellpadding="0" cellspacing="0" width="600" style="background-color: #d0e5ff; border: 1px solid #dddddd; border-radius: 5px;">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <img src="cid:logo" alt="PREMED Logo" style="max-width: 155px; height: 90px;">
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Código: ${code}</h1>
                                <p style="color: #666666; font-size: 16px; line-height: 24px; text-wrap: balance;">
                                    Si usted no empezo el proceso de recuperacion de cuenta favor de ingorar este mensaje.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px 0; color: #666666; font-size: 12px; font-style: italic;">
                                &copy; ${new Date().getUTCFullYear()} PREMED. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`

    return template
}