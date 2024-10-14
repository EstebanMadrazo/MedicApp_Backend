import { Handler, Request, Response } from "express";
import { Review } from "../models/review.model.ts";
import { updateReviewScore, getReviewsScoreFromSubject, storeReview, updateReviewComment } from "../utils/DAO/dao.utils.ts";

/**
 * 
 * @param req For creating a review req must contain body, for retrieving the reviews req must contain query
 * @arg body Must be equal to { appointment_uuid: string, evaluator_uuid: string, subject_uuid, score: number } 
 * @arg query Must be equal to { subject: string }
 * @return For body "create successfully" for query { total_score: number, total_rows: number }
 */
export const handleReviews: Handler = async (req: Request, res: Response) => {
    console.log(req.body)
    console.log(req.query)
    try {
        const hasQuery = Object.keys(req.query).length
        if (hasQuery !== 0) {
            const uuid = req.query.subject as string
            const reviews = await handleQuery(uuid)
            return res.status(200).json(reviews)
        }
        const review: Review = req.body
        await handleReview(review)
        return res.status(200).json({ message: "Successfully created review" })
    } catch (error: any) {
        console.log(error)
        return res.status(500).json(error)
    }
}
/**
 * 
 * @param subject Contains the UUID of the subject
 * @returns Object with the sum of all scores and the total number of scores that the subject has { total_score: number, total_rows: number }
 */
const handleQuery = async (subject: string) => {
    console.log('Query: ', subject)
    try {
        const reviews = await getReviewsScoreFromSubject(subject)
        return reviews
    } catch (error: any) {
        console.log(error)
        return error
    }

}
const handleReview = async (review: Review) => {
    console.log('Reviews: ', review)
    const rev = new Review()
    rev.createReview(review)
    try {
        const result = await storeReview(rev)
        return result
    } catch (error: any) {
        throw new Error(error)
    }
}

export const handleUpdateScore:Handler = async(req:Request, res:Response) => {
    const {id, score} = req.query
    if(!id || !score){
        return res.status(400).json({
            error: "Update Score",
            message: "ID or Score not found"
        })
    }
    try{
        await updateReviewScore(parseInt(id as string),parseInt(score as string))
        return res.status(200).json({message:"OK"})
    }catch(error:any){
        console.log(error)
        return res.status(500).json({
            error: "Update Score",
            message: error.message
        })
    }
}

export const handleUpdateComments:Handler = async (req:Request, res:Response) => {
    const {id, comment} = req.body
    if(!comment || !id){
        return res.status(400).json({
            error: "Update Comment",
            message: "ID or Comment not found"
        })
    }

    try{
        await updateReviewComment(id, comment)
        return res.status(200).json({message:"OK"})
    }catch(error:any){
        console.log(error)
        return res.status(500).json({
            error: "Update Score",
            message: error.message
        })
    }
}