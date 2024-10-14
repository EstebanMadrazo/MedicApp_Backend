2a486eee-d779-4d68-8902-c878c773e5b7
async (req: Request, res: Response) => {
    const data = req.body;
    console.log(data)
    if (!data.patientQ) {
        return res.status(400).json({
            message: "Questionnaire is not found in body."
        })
    }
    //const patient = new Patient(data.healthQuestionnaire);
    const patient = new Patient()
    patient.createPatient(data.patientQ)
    patient.id = 8
    console.log(patient.id)
    console.log(patient)
    try {
        const result = await storePatientInDB(patient);
        console.log(result)
    } catch (error: any) {
        console.log(error)
    }
    return res.json({ message: "OK" })
}