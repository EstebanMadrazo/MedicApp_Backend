import { Handler, Request, Response } from 'express'
import { User } from '../models/UserModel/User.ts'
import { createRecoveryCode, createUUID, hashPassword } from '../utils/Encryption/EncryptionHandler.ts'
import { updatePassword, storeUser, getUserByAccount, updatePhoneNumber, getAllUsers, getUserByUUID, storeRecoveryCode, getRecoveryCode, updateRecoveryCode, updateFirstName, updateLastName, updateBirthdate, updateState, updateProfilePicture, deleteUserAccount, getUserByUUIDPool, updateUserAccess } from '../utils/DAO/Users/DaoUsers.ts'
import { createEvent } from './event.controller.ts'
import { EVENT_TYPE } from '../utils/EventTypes/EventType.utils.ts'
import { handlePatientInformation } from './patient.controller.ts'
import { handleMedicInformation, handleScheduleAvailability } from './medic.controller.ts'
import { handleRepresentativeInformation } from './representative.controller.ts'
import { getAllPatients, getPatientInformationByUUID, updatePatientScore, updateQuestionnaire } from '../utils/DAO/Patients/DaoPatients.ts'
import { getAllMedics, getMedicInformationByUUID, getMedicSchedule, updateMedicScore, updateSchedulePreferences } from '../utils/DAO/Medics/DaoMedics.ts'
import { getAllRepresentatives, getRepresentativeInformationByUUID, updateProductsCatalog, updateRepresentativeScore } from '../utils/DAO/Representative/DaoRepresentative.ts'
import { handlePasswordRecoveryMail } from './mailer.controller.ts'
import path from 'path'
import { checkAvailability, createSchedule } from './schedule.controller.ts'

export const registerUserHandler: Handler = async (req: Request, res: Response) => {
    const data = req.body
    const valid = validateData(data)
    if (!valid) {
        return res.status(500).json(
            {
                message: "Bad JSON body syntax, verify with attached",
                correctSyntax: [
                    {
                        state: 'your-state',
                        phoneNumber: 'your-phone-number',
                        firstName: 'your-first-name',
                        lastName: 'your-last-name',
                        role: 'your-role',
                        email: 'your-email',
                        password: "your-secret-password",
                        birthdate: "yyyy-MM-dd"
                    }
                ]
            }
        )
    }
    let user
    try {
        user = new User(data)
        user.setUserUUID(createUUID())
        const result = await storeUser(user)
        if (result !== 'Success') {
            return res.status(500).json({
                error: "User Creation",
                message: result
            })
        }

        createEvent(
            EVENT_TYPE.CREATE,
            {
                uuid: user.getUserUUID(),
                username: user.getUsername(),
                password: user.getUserPassword(),
                role: user.getUserRole(),
                is_first_login: 1,
                access: user.getIsAccessRestricted(),
                deleted: user.getIsDeleted()
            })
        return res.status(201).json({
            message: EVENT_TYPE.CREATE,
            uuid: user.getUserUUID()
        })
    } catch (error: any) {
        return res.status(500).json({ error: error.message })
    } finally {
        user = null
    }
}

export const handlePasswordUpdate = async (uuid: string, password: string) => {
    try {
        const credentials = {
            uuid: uuid,
            pwd: hashPassword(password)
        }
        const result = await updatePassword(credentials)
        //@ts-ignore
        if (result.affectedRows === 0) {
            throw new Error('Invalid UUID provided')
        }
        const user: any = await getUserByUUID(credentials.uuid)

        createEvent(
            EVENT_TYPE.UPDATE,
            {
                uuid: user?.uuid,
                password: user?.password,
                timestamp: new Date()
            })
    } catch (error: any) {
        console.log(error)
        throw new Error('Could not update password')
    }
}


const validateData = (data: User) => {
    if (!data.state || !data.phoneNumber || !data.firstName || !data.lastName || !data.role || !data.email || !data.password || !data.birthDate) {
        return false
    }
    return true
}

export const handleUserProfile: Handler = async (req: Request, res: Response) => {
    console.log(req.headers.isValidToken)
    console.log(req.body.payload)
    const isValid = req.headers.isValidToken
    const account = req.body.payload
    console.log(req.body)
    const { date } = req.query
    console.log(date)
    try {
        if (isValid !== 'Valid') {
            // If it's not valid make request to retrieve valid token and send it back to the user
        }
        const user = await getUserByAccount(account) // replace this with account property
        let resultInfo: any
        //@ts-ignore
        switch (user[0].role) {
            case "Medic":
                //@ts-ignore
                resultInfo = await handleMedicInformation(user[0].email)
                //@ts-ignore
                const availability = date ? await handleScheduleAvailability(user[0].uuid, date) : null
                //@ts-ignore
                resultInfo[0].schedule_preferences = await getMedicSchedule(user[0].uuid)
                //@ts-ignore
                resultInfo[0].availability = date ? availability : null
                //@ts-ignore
                resultInfo[0].schedule_preferences.schedule = checkAvailability(resultInfo[0].schedule_preferences.schedule, availability, date as string)
                // TODO: checkAvailability() debe recibir el calendario que es un array de objects y se debe de matchear la hora recibida de availability con las que se encuentran en el object
                // Y reemplazar isAvailable = false en caso de que sea un match
                // La funcion debe de devolver un array de objects 
                break;
            case "Patient":
                //@ts-ignore
                resultInfo = await handlePatientInformation(user[0].email)
                break;
            //@ts-ignore
            case "Representative":
                //@ts-ignore
                resultInfo = await handleRepresentativeInformation(user[0].email)
                break;
            case "Admin":
                //@ts-ignore
                //resultInfo = await handleAdminInformation(user[0].email)
                break;
        }
        if (!user) {
            return res.status(400).json({
                error: "User Information",
                message: "Could not retrieve user information"
            })
        }
        return res.status(200).json(resultInfo)
    } catch (error: any) {
        console.log(error)
    }
}

export const handleUserInfo: Handler = async (req: Request, res: Response) => {
    console.log(req.query)
    const { userUUID } = req.query
    console.log(userUUID)
    if (!userUUID) {
        return res.status(400).json({
            error: "User Information",
            message: "userUUID not found in params"
        })
    }
    try {

        const user = await getUserByUUIDPool(userUUID as string)
        if (!user) {
            return res.status(400).json({
                error: "User Information",
                message: "Could not retrieve user information"
            })
        }
        console.log(user)
        let resultInfo
        switch (user.role) {
            case "Medic":
                resultInfo = await getMedicInformationByUUID(user.uuid)
                break;
            case "Patient":
                resultInfo = await getPatientInformationByUUID(user.uuid)
                break;
            case "Representative":
                resultInfo = await getRepresentativeInformationByUUID(user.uuid)
                break;
            case "Admin":
                //resultInfo = await handleAdminInformation(user[0].email)
                break;
        }
        return res.status(200).json(resultInfo)
    } catch (error: any) {
        console.log(error)
        return res.status(500).json(error)
    }
}

export const deleteAccountHandler: Handler = async (req: Request, res: Response) => {
    console.log(req.body)
    const account = req.body.payload
    const isValid = req.headers['isValidToken']
    if (!isValid) {
        return res.status(400).json({
            error: "Account Deletion",
            message: "Token provided is not valid"
        })
    }
    if (!account) {
        return res.status(400).json({
            error: "Account Deletion",
            message: "No user account found in body"
        })
    }
    try {
        await deleteUserAccount(account)
        createEvent(
            EVENT_TYPE.DELETE,
            {
                username: account,
                timestamp: new Date()
            })
        return res.status(200).json({ message: "Successfully Deleted User account" })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({
            error: "Account Deletion",
            message: error.message
        })
    }
}

export const updateInfoHandler: Handler = async (req: Request, res: Response) => {
    console.log('Update User Info')
    console.log('USER INFO BODY: ', req.body)
    const {
        firstName,
        lastName,
        birthdate,
        state,
        phoneNumber,
        password,
        questionnaire,
        productCatalog,
        schedulePreferences,
        profilePicture,
    } = req.body.update
    const { uuid, role } = req.body

    if (firstName !== undefined) {
        try {
            await updateFirstName({ uuid, firstName })
            return res.status(200).json({ message: "Successfully Update First Name" })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ error: error.message })
        }
    }
    if (lastName !== undefined) {
        try {
            await updateLastName({ uuid, lastName })
            return res.status(200).json({ message: "Successfully Update Last Name" })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ error: error.message })
        }
    }
    if (birthdate !== undefined) {
        try {
            const bd = new Date(birthdate)
            bd.setUTCMinutes(bd.getUTCMinutes() + bd.getTimezoneOffset())
            await updateBirthdate({ uuid, birthdate: bd })

            return res.status(200).json({ message: "Successfully Update Birthdate" })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ error: error.message })
        }
    }
    if (state !== undefined) {
        try {
            await updateState({ uuid, state })
            return res.status(200).json({ message: "Successfully Update State" })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ error: error.message })
        }
    }
    if (phoneNumber !== undefined) {
        try {
            await updatePhoneNumber({ uuid, phoneNumber })
            return res.status(200).json({ message: "Successfully Updated Phone Number" })
        } catch (error: any) {
            return res.status(500).json({ error: error.message })
        }
    }
    if (password !== undefined) {
        try {
            await handlePasswordUpdate(uuid, password)
            return res.status(200).json({ message: "Successfully Update Password" })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ error: error.message })
        }
    }
    if (questionnaire !== undefined) {
        try {
            await updateQuestionnaire(questionnaire, uuid)
            return res.status(200).json({ message: "Successfully Update Questionnaire" })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ error: error.message })
        }
    }
    if (productCatalog !== undefined) {
        console.log('Update Handler Function:', productCatalog)
        console.log('Update Handler Function:', productCatalog.productCatalog)
        try {
            await updateProductsCatalog(productCatalog, uuid)
            return res.status(200).json({ message: "Successfully Update Products Catalog" })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ error: error.message })
        }
    }
    if (schedulePreferences !== undefined) {
        try {
            const newSchedulePreferences = await createSchedule(schedulePreferences, uuid)
            await updateSchedulePreferences(newSchedulePreferences)
            return res.status(200).json({ message: "Successfully Update Schedule Preferences" })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ error: error.message })
        }
    }
    /* if (profilePicture !== undefined && role !== undefined) {
        try {
            await updateProfilePicture(profilePicture, uuid, role)
            return res.status(200).json({ message: "Successfully Update Profile Picture" })
        } catch (error: any) {
            console.log(error)
            return res.status(500).json({ error: error.message })
        }
    } */

    return res.status(400).json({
        error: "Update User Info",
        message: "Could not update user info"
    })
}

export const getUsersHandler: Handler = async (req: Request, res: Response) => {
    const users = await getAllUsers()
    return res.status(200).json(users)
}

export const updateScoreHandler: Handler = async (req: Request, res: Response) => {
    const { role, score, uuid } = req.body
    console.log(req.body)
    try {
        switch (role) {
            case 'Patient':
                await updatePatientScore(uuid, score)
                break;
            case 'Medic':
                await updateMedicScore(uuid, score)
                break;
            case 'Representative':
                await updateRepresentativeScore(uuid, score)
                break
        }
        return res.status(200).json({ message: 'Successfully updates score for user ', uuid })
    } catch (error: any) {
        return res.status(500).json(error)
    }
}

export const recoverPasswordHandler: Handler = async (req: Request, res: Response) => {
    console.log(req.body)
    const { account } = req.body
    const code = createRecoveryCode()
    try {
        await getUserByAccount(account)
        await handlePasswordRecoveryMail(account, code)
        await storeRecoveryCode(account, code)
        return res.status(200).json({
            message: "Recovery Code sent successfully"
        })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json(error.message)
    }
}

export const recoverCodeHandler: Handler = async (req: Request, res: Response) => {
    const { account, code } = req.body
    try {
        const result = await getRecoveryCode(account)
        console.log(result)
        for (const element of result) {
            if (element.code === code && element.is_used === 0) {
                console.log("Can change password")
                await updateRecoveryCode(element)
                return res.status(200).json("Valid")
            }
        }
        throw new Error('No se encontraron coincidencias para el codigo proporcionado')
    } catch (error: any) {
        console.log(error)
        return res.status(500).json(error.message)
    }
}

export const updateRecoverPasswordHandler: Handler = async (req: Request, res: Response) => {
    const recoverySecret = process.env.RECOVERY_SECRET
    console.log(req.body)
    if (recoverySecret !== req.body.recoverySecret) {
        return res.status(400).json({
            error: "Recovery Password",
            message: "Recovery secret does not match"
        })
    }
    try {

        const credentials = {
            account: req.body.account,
            pwd: hashPassword(req.body.password)
        }
        const result = await updatePassword(credentials)
        //@ts-ignore
        if (result.affectedRows === 0) {
            throw new Error('Invalid email provided')
        }
        const user = await getUserByAccount(credentials.account)

        createEvent(
            EVENT_TYPE.UPDATE,
            {
                //@ts-ignore
                uuid: user?.[0].uuid,
                //@ts-ignore
                password: user?.[0].password,
                timestamp: new Date()
            })

        if (!result) {
            return res.status(400).json({
                error: "Password Update",
                message: "Could not update password"
            })
        }
    } catch (error: any) {
        console.log(error)
        return res.status(500).json(error.message)
    }

    return res.status(200).json({ message: "Password Recovered" })
}

export const handleProfilePicture = (req: Request, res: Response) => {
    const { uuid } = req.query
    const baseUrl = `C:/Users/hp/Desktop/Avatars/`
    const folderName = uuid ? `${uuid}` : 'Default'
    const fileName = uuid ? `profilePicture-${uuid}.webp` : `Default.png`
    const filePath = path.join(baseUrl, folderName, fileName);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error retrieving profile picture');
        }
    });
}

export const handleUpdateProfilePicture: Handler = async (req: Request, res: Response) => {
    console.log(req.query)
    const { uuid, url } = req.query
    try {
        const user = await getUserByUUID(uuid as string)
        await updateProfilePicture(url as string, uuid as string, user.role as string)
        return res.status(200).json({
            message: 'Successfully updated profile picture',
            url: url,
            uuid: uuid,
            role: user.role
        })
    } catch (error: any) {
        console.log(error.message)
        return res.status(500).json({
            error: "Upload Profile Picture",
            message: error.message
        })
    }
}
type users = {
    patients: object[],
    representatives: object[],
    medics: object[]
}
export const handleAllUsers: Handler = async (req: Request, res: Response) => {

    const { payload } = req.body
    const user: any = await getUserByAccount(payload)
    if (user[0].role !== 'Admin') {
        return res.status(403).json({
            message: "User not authorized to access."
        })
    }

    try {
        Promise.all([getAllPatients(), getAllRepresentatives(), getAllMedics()]).then(result => {
            const user: users = {
                patients: result[0] as object[],
                representatives: result[1] as object[],
                medics: result[2] as object[]
            }
            const filterPatients = user.patients.map(user => {
                //@ts-ignore
                const { id, password, patient_uuid, payment_methods, ...patients } = user
                return patients
            })
            const filterRepresentatives = user.representatives.map(user => {
                //@ts-ignore
                const { id, password, rep_uuid, payment_methods, ...representatives } = user
                return representatives
            })
            const filterMedics = user.medics.map(user => {
                //@ts-ignore
                const { id, password, hp_uuid, payment_methods, ...medics } = user
                return medics
            })
            user.patients = filterPatients
            user.representatives = filterRepresentatives
            user.medics = filterMedics
            return res.status(200).json(user)
        })
        console.log('All Users')
    } catch (error: any) {
        return res.status(500).json({
            error: "All Users",
            message: error.message
        })
    }
}

export const handleUserAccess: Handler = async (req: Request, res: Response) => {
    const { payload } = req.body
    const uuids: Array<string> = req.body.uuids
    if (!uuids) {
        return res.status(400).json({
            error: "Update User Access",
            message: "UUID or access not provided"
        })
    }

    const user: any = await getUserByAccount(payload)
    if (user[0].role !== 'Admin') {
        return res.status(403).json({
            error: "Update User Access",
            message: "Not authorized to perfom action"
        })
    }
    const failedArray:Array<string> = []
    const successArray: Array<string> = []
    try {
        uuids.forEach(async (uuid) => {
            try{
                const user:any = await getUserByUUID(uuid)
                console.log(user)
                const access = user.is_access_restricted
                let auxAccess
                if(access == true){                
                    auxAccess = false
                }else if(access == false){
                    auxAccess = true
                }
                await updateUserAccess(auxAccess as boolean, uuid)
                successArray.push(uuid)
            }catch(error:any){
                failedArray.push(uuid)
            }
        });
        return res.status(200).json({
            success: successArray,
            failed: failedArray
        })
    } catch (error: any) {
        return res.status(500).json({
            error: 'Update User Access',
            message: error.message
        })
    }
}