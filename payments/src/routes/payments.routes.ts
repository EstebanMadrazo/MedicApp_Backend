import { Router } from 'express'
import { handleCancelPaymentPayPal, handleCapturePayPal, handlePaymentPayPal } from '../controllers/payment.controller'
import { eventHandler } from '../controllers/events.controller'

export const router = Router()

router.post('/v1/payments/create-order', handlePaymentPayPal)
router.get('/v1/payments/capture-order', handleCapturePayPal)
router.get('/v1/payments/cancel-order', handleCancelPaymentPayPal)
router.post('/v1/payments/events', eventHandler)
