export class Medic{

    uuid: string = ''
    professionalID: string = ''
    specialities:object = {}
    mainSt: string = ''
    streetIntersections = ''
    neighborhood: string = ''
    zipAdress: string = ''
    city: string = ''
    office_state: string = ''
    country: string = ''
    rfc: string = ''
    isEmergency: number = 0
    isApproved: number = 0
    profilePicture: string = ''
    score:number = 0

    createMedic(medic: Medic) {
        this.uuid = medic.uuid
        this.professionalID = medic.professionalID
        this.specialities = medic.specialities
        this.mainSt = medic.mainSt
        this.streetIntersections = medic.streetIntersections
        this.neighborhood = medic.neighborhood
        this.zipAdress = medic.zipAdress
        this.city = medic.city
        this.office_state = medic.office_state
        this.country = medic.country
        this.rfc = medic.rfc
        this.isEmergency = medic.isEmergency
        this.isApproved = medic.isApproved ? medic.isApproved : 1
        this.profilePicture = medic.profilePicture ? medic.profilePicture : `${process.env.PROTOCOL}${process.env.HOST_IP}:${process.env.PORT}/v1/user/profilePicture?uuid=${medic.uuid}`
        this.score = medic.score ? medic.score : 0
    }

    setUUID(uuid: string): void {
        this.uuid = uuid
    }
    getUUID(): string {
        return this.uuid
    }
    setProfilePicture(picture: string): void {
        this.profilePicture = picture
    }
    getProfilePicture(): string {
        return this.profilePicture
    }
}