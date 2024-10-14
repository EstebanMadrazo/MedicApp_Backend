
export class Review{
    id!:number | undefined
    appointment_uuid!:string
    evaluator_uuid!: string
    subject_uuid!:string
    score!:number
    comments!:Object

    createReview(review:Review){
        this.id = review.id ? review.id : undefined
        this.appointment_uuid = review.appointment_uuid
        this.evaluator_uuid = review.evaluator_uuid
        this.subject_uuid = review.subject_uuid
        this.score = review.score
        review.comments ? this.comments = review.comments : this.comments = {}
    }
}