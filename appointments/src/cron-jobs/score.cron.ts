import cron from 'node-cron'
import dotenv from 'dotenv'
import { handleScoreUpdate } from '../controllers/cron.controller.ts'
dotenv.config()

cron.schedule('0 2 * * *', handleScoreUpdate, {name: 'update-score'})