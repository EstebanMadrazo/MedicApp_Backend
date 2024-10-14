import express from "express"
import { handleAppointment, handleAppointmentCancel, handleAppointmentComment, handleAppointmentDeletion, handleAppointmentDetails, handleAppointmentInfo, handleAppointmentReport, handleAppointmentRequest, handleAppointmentReschedule, handleFilterAppointments } from "../controllers/appointments.controller.ts";
import { eventHandler } from "../controllers/event.controller.ts";
import { handleUpdateScore, handleReviews, handleUpdateComments } from "../controllers/reviews.controller.ts";
import { validateAuthorization } from "../middleware/middleware.ts";

export const router = express.Router()

router.post('/v1/appointments/events', eventHandler)
router.post('/v1/appointments/createAppointment', validateAuthorization, handleAppointment)
router.post('/v1/appointments/rescheduleAppointment', handleAppointmentReschedule)
router.post('/v1/appointments/requestAppointment', handleAppointmentRequest)
router.post('/v1/appointments/cancelAppointment', handleAppointmentCancel)
router.post('/v1/appointments/reviews', handleReviews)
router.get('/v1/appointments/reviews', handleReviews)
router.patch('/v1/appointments/updateReviewScore', validateAuthorization, handleUpdateScore)
router.patch('/v1/appointments/updateReviewComments', validateAuthorization, handleUpdateComments)
router.get('/v1/appointments/appointmentInfo', handleAppointmentInfo)
router.get('/v1/appointments/appointmentDetails', handleAppointmentDetails)
router.get('/v1/appointments/filterAppointments', /* validateAuthorization, */ handleFilterAppointments)
router.post('/v1/appointments/commentAppointment', /* validateAuthorization, */ handleAppointmentComment)
router.delete('/v1/appointments/noPriorityAppointments', validateAuthorization, handleAppointmentDeletion)
router.get('/v1/appointments/report', validateAuthorization, handleAppointmentReport)