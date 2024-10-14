import { hashPassword } from '../../utils/Encryption/EncryptionHandler'

export class User {
    id: string = ""
    state: string = ""
    phoneNumber: string = ""
    firstName: string = ""
    lastName: string = ""
    sex: string = ""
    role: string = ""
    email: string = ""
    password: string = ""
    birthDate: string = ""
    isAccessRestricted = false
    isDeleted = false

    constructor(data: User) {
        this.initializeData(data)
    }

    initializeData(data: User) {
        try {
            this.state = data.state
            this.phoneNumber = data.phoneNumber;
            this.firstName = data.firstName;
            this.lastName = data.lastName;
            this.sex = data.sex
            this.role = data.role;
            if (!this.validateEmail(data.email.toLowerCase())) {
                this.getTimeStamp();
                throw new Error("Something went wrong with Email")
            }
            this.email = data.email.toLowerCase();
            this.password = hashPassword(data.password);
            if (!this.validateDate(data.birthDate)) {
                this.getTimeStamp();
                throw new Error("Something went wrong with birthDate")
            }
            this.birthDate = data.birthDate
            this.isAccessRestricted = data.isAccessRestricted === undefined ? false : data.isAccessRestricted
            this.isDeleted = data.isDeleted === undefined ? false : data.isDeleted
        } catch (e: any) {
            console.log(e.message)
            this.getTimeStamp();
            throw new Error(e.message)
        }
    }

    validateDate(evaluationDate: string): Boolean {
        var date_regex = /^(19[0-9]{2}|[2-9][0-9]{3})\-(0[1-9]|1[012])\-([123]0|[012][1-9]|31)$/;
        let status = false
        if (!date_regex.test(evaluationDate)) {
            console.log("Invalid date format");
            this.getTimeStamp();
            return status;
        }

        return !status;
    }

    validateEmail(evaluationEmail: string): Boolean {
        var emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
        let status = false
        if (!emailRegex.test(evaluationEmail)) {
            console.log("Invalid email format")
            return status;
        }

        return !status
    }

    getTimeStamp = (): void => {
        const timestamp = new Date().toString()
        console.log(timestamp)
    }

    setUserUUID(uuid: string): void {
        this.id = uuid
    }

    getUserUUID(): string {
        return this.id
    }

    getUsername(): string {
        return this.email
    }
    getUserPassword(): string {
        return this.password
    }
    getUserRole(): string {
        return this.role
    }
    getIsAccessRestricted(): boolean {
        return this.isAccessRestricted
    }
    setIsAccessRestricted(access: boolean) {
        this.isAccessRestricted = access
    }
    getIsDeleted(): boolean {
        return this.isDeleted
    }
    setIsDeleted(access: boolean) {
        this.isDeleted = access
    }
}
