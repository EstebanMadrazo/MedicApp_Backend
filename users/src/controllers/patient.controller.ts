import { Request, Response } from "express";
import { Patient } from "../models/PatientModel/Patient";
import { getPatientInformation, storePatientInDB } from "../utils/DAO/Patients/DaoPatients";

export const registerPatientHandler = async(req: Request, res: Response) => {
    const {uuid, patientQ, profile_picture} = req.body
    if (!patientQ) {
        return res.status(400).json({
            message: "Questionnaire is not found in body."
        })
    }
    try{
        const patient = new Patient();
        patient.setQuestionnaire(patientQ);
        patient.setUUID(uuid);
        (profile_picture && profile_picture !== "") ? 
        patient.assignProfilePicture(profile_picture) : patient.assignProfilePicture(`${process.env.PROTOCOL}${process.env.HOST_IP}:${process.env.PORT}/v1/user/profilePicture`);
        const result = await storePatientInDB(patient);
        if(result !== 'Success'){
            return res.status(500).json({
                error: "Patient Creation",
                message: result
            })
        }
        return res.status(201).json({
            message: "Patient Created",
            uuid: patient.uuid
        })
    }catch(error: any){
        console.log(error)
    }
    
}

export const handlePatientInformation = async (account: string) => {
    try{
        
        const result = await getPatientInformation(account)
        return result
    }catch(error: any){
        console.log(error.message)
        console.log("Error in Patient Information on Patient Controller")
    }
}