import express, { Response, Request } from "express"
import path from 'path'
// *---Model Imports---*
import { deleteAccountHandler, getUsersHandler, handleAllUsers, handleProfilePicture, handleUpdateProfilePicture, handleUserAccess, handleUserInfo, handleUserProfile, recoverCodeHandler, recoverPasswordHandler, registerUserHandler, updateInfoHandler, updateRecoverPasswordHandler, updateScoreHandler } from "../controllers/user.controller.ts"
import { uploadHandler } from "../utils/Upload/UploadHandler.ts"
import { registerPatientHandler } from "../controllers/patient.controller.ts"
import { eventHandler } from "../controllers/event.controller.ts"
import { availabilityHandler, createScheduleHandler, discoverMedicsHandler, discoverSpecialitiesHandler, filterHandler, medicAvailabilityHandler, registerMedicHandler, scheduleHandler } from "../controllers/medic.controller.ts"
import { validateAuthorization } from "../middleware/middleware.ts"
import { handleProductCatalog, registerRepresentativeHandler } from "../controllers/representative.controller.ts"
import { handleMailer } from "../controllers/mailer.controller.ts"
import { handleImageConverter } from "../utils/Converter/converter.utils.ts"
import { uploadProfilePictureMiddleware } from "../utils/UpdateProfilePicture/UpdateProfilePicture.ts"

export const router = express.Router()

// *---Endpoints---*

// *--- Events Endpoint ---*
router.post('/v1/user/events', eventHandler)

// *--- Register Endpoints ---*
router.post('/v1/user/register', registerUserHandler)
router.post('/v1/user/register/medic', registerMedicHandler)
router.post('/v1/user/register/patient', registerPatientHandler)
router.post('/v1/user/register/representative', registerRepresentativeHandler)

// *--- User Info Endpoints ---*
router.post('/v1/user/userInfo', validateAuthorization, handleUserProfile) // Obtain specific information from a type of user
router.patch('/v1/user/updateInfo', validateAuthorization, updateInfoHandler) // Update User Information, one item at the time
router.post('/v1/user/medicSchedule', validateAuthorization, scheduleHandler) // Obtain Medic Schedule
router.get('/v1/user/productCatalog', validateAuthorization, handleProductCatalog) // Obtain products catalong
router.patch('/v1/user/productCatalog', validateAuthorization, handleProductCatalog) // Modify one item from product catalog
router.post('/v1/user/availability', validateAuthorization, availabilityHandler) // Mark an hour as occupied for a specific medic
router.get('/v1/user/availability', validateAuthorization, availabilityHandler) // Retrieve all the occupied hours for a specific medic
router.delete('/v1/user/availability', validateAuthorization, availabilityHandler) // Unmark an hour as occupied for a specific medic
router.get('/v1/user/medicAvailability', validateAuthorization, medicAvailabilityHandler)
router.post('/v1/user/profilePicture',validateAuthorization) //TODO: Create the controller and middleware to receive, convert and store the profilePicture to webp format 
router.patch('/v1/user/profilePicture', /* validateAuthorization , */ uploadProfilePictureMiddleware , handleImageConverter, handleUpdateProfilePicture)

// *--- Utility Endpoints ---*
router.post('/v1/user/filterMedics', filterHandler)
router.post('/v1/user/schedule', scheduleHandler)
router.get('/v1/user/discoverMedics', discoverMedicsHandler)
router.get('/v1/user/discoverSpecialities', discoverSpecialitiesHandler)
router.get('/v1/user/user', handleUserInfo)
router.get('/v1/user/profilePicture', handleProfilePicture)
router.post('/v1/user/createSchedule', createScheduleHandler)
router.get('/v1/user/all', validateAuthorization, handleAllUsers)
router.patch('/v1/user/userAccess', validateAuthorization,handleUserAccess)

// *-- Mailer ---*
router.post('/v1/user/uploadDocuments', uploadHandler, handleImageConverter ,handleMailer)

// *--- Delete account ---*
router.delete('/v1/user/deleteAccount', validateAuthorization, deleteAccountHandler) //! Mark the account as deleted in database but not directly deleted it

// *--- Recover Password ---*
router.post('/v1/user/recoverPassword', recoverPasswordHandler)
router.post('/v1/user/recoverCode', recoverCodeHandler)
router.patch('/v1/user/updateRecoverPassword', updateRecoverPasswordHandler)

// *--- Appointment Cron-Jobs Endpoints ---*
router.get('/v1/user/getUsers', getUsersHandler)
router.patch('/v1/user/updateScore', updateScoreHandler)

//TODO Testing
router.get('/v1/user/test', handleMailer)
router.get('/template', async (req:Request, res:Response)=>{
    const pathToFile = path.resolve('src/utils/MailTemplate/template.html')
    return res.sendFile(pathToFile)
})