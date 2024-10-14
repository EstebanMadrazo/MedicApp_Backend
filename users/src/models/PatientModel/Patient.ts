const crypto = require("crypto")

export class Patient{
    uuid:string = ''
    healthQuestionnaire = {}
    // Different credit cards / debit cards
    payment_methods = {}
    profile_picture:string =""
    is_access_retricted:boolean = false
    score:number = 0

    createPatient(data: Patient){
        this.healthQuestionnaire = data.healthQuestionnaire
        this.uuid = data.uuid
    }
    
    getRandomInt(max: number):number {
        return Math.floor(Math.random() * max)
    }

    assignPaymentMethods(paymentInfo: JSON){
        //TODO payment methods
        //this.payment_methods = paymentInfo;
    }

    assignProfilePicture(profilePicture: string){
        this.profile_picture = profilePicture
    }

    setUUID(uuid:string):void{
        this.uuid = uuid
    }

    setQuestionnaire(questionnaire: JSON):void{
        this.healthQuestionnaire = questionnaire
    }
}