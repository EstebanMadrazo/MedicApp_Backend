//import mysql, { Connection } from 'mysql2/promise';
//import env from 'dotenv';
import { User } from '../../../models/UserModel/User';
import { POOL } from '../DAO';
//env.config()

/*let connection: Connection;

export async function openDB_Connection(): Promise<void> {

    try {
        connection = await mysql.createConnection({
            host: process.env.PREMED_HOST,
            user: process.env.PREMED_USER,
            password: process.env.PREMED_PWD,
            database: process.env.PREMED_DB
        });
    } catch (e: any) {
        console.log("Error connecting to DB ", new Date())
    }

}

export async function closeDB_Connection(): Promise<void> {
    connection.end()
}*/
export async function getUserByUUID(userUUID: string) {
    try {
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'SELECT * FROM users where uuid = (?)'
        const value = [userUUID]
        const [result, fields] = await connection.execute(sql, value)
        //console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        connection.release()
        //@ts-ignore
        return result[0]
    } catch (error: any) {
        console.log(error)
        throw new Error(error)
    } finally {
        //await closeDB_Connection()
    }
}
export async function getUserByUUIDPool(userUUID: string) {
    try {
        const singlePool = await POOL.getConnection()
        const sql = 'SELECT * FROM USERS where uuid = (?)'
        const value = [userUUID]
        const [result, fields] = await singlePool.execute(sql, value)
        //console.log(result)
        //console.log(fields)
        POOL.releaseConnection(singlePool)
        //@ts-ignore
        return result[0]
    } catch (error: any) {
        console.log(error)
        throw new Error(error)
    }

}

export async function storeUser(values: User): Promise<string> {
    console.log(values)
    //await openDB_Connection();
    const sql = ('INSERT INTO users (state, uuid, phone_number, given_name, family_name, sex, role, email, password, birthdate, is_access_restricted) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    //const values = ['+52','0123456799','Dummy','Dummynson','Admin','dummy2@test.com','mysupersecurepassword','2024-01-23']
    const vals = [values.state, values.id, values.phoneNumber, values.firstName, values.lastName, values.sex, values.role, values.email, values.password, values.birthDate, values.isAccessRestricted]
    try {
        const [result, fields] = await POOL.execute(sql, vals)
        console.log(result);
        //console.log(fields)
    } catch (err: any) {
        console.log(err)
        throw new Error(err.sqlMessage)
    } finally {
        //await closeDB_Connection()
    }

    return "Success"
}


export async function updatePhoneNumber(values: { uuid: string, phoneNumber: string }): Promise<void> {
    try {
        //await openDB_Connection()
        const sql = 'UPDATE users SET phone_number = (?) where users.uuid = (?)'
        const vals = [values.phoneNumber, values.uuid]

        const [result, fields] = await POOL.execute(sql, vals)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
    } catch (error: any) {
        console.log(error)
        throw new Error(error)
    } finally {
        //await closeDB_Connection()
    }
}

export async function getAllUsers() {
    try {
        //await openDB_Connection()
        const sql = 'SELECT uuid,role FROM users'
        const [rows, fields] = await POOL.execute(sql)
        //console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        return rows;
    } catch (error) {
        console.log(error)
        return "Failed"
    } finally {
        //await closeDB_Connection()
    }
}

export async function getUserByAccount(account: string | undefined) {
    try {
        //await openDB_Connection()
        const connection = await POOL.getConnection()
        const sql = 'SELECT * FROM users where email = (?)'
        const values = [account]

        const [row, fields] = await connection.execute(sql, values)
        console.log(row)
        //console.log(fields)
        if (Object.keys(row).length === 0) {
            throw new Error("El correo proporcionado no se encuentra en la base de datos")
        }
        //await closeDB_Connection()
        connection.release()
        return row
    } catch (error: any) {
        console.log("Error in getUserByAccount function in DAOUSer")
        throw new Error(error.message)

    } finally {
        //await closeDB_Connection()
    }
}

type UpdatePassword = {
    uuid?: string,
    account?: string,
    pwd: string
}

export async function updatePassword(credentials: UpdatePassword) {
    console.log(credentials)
    try {
        //await openDB_Connection()
        let sql = credentials.uuid ? 'UPDATE users SET password = (?) where uuid = (?)' : 'UPDATE users SET password = (?) where email = (?)'
        let value = credentials.uuid ? credentials.uuid : credentials.account
        const values = [credentials.pwd, value]

        const [result, fields] = await POOL.execute(sql, values)
        console.log(result)
        //await closeDB_Connection()
        return result
    } catch (error: any) {
        console.log("Error trying to change password: ", error.message)
        throw new Error(error.message)
    } finally {
        //await closeDB_Connection()
    }
}


export async function updateFirstName(data: { uuid: string, firstName: string }) {
    try {
        //await openDB_Connection()
        const sql = 'UPDATE users SET given_name = (?) where uuid = (?)'
        const values = [data.firstName, data.uuid]
        const [result, fields] = await POOL.execute(sql, values)
        console.log(result)
        //@ts-ignore
        if (result.changedRows === 0) {
            throw new Error("No row matches")
        }
        //console.log(fields)
        //await closeDB_Connection()
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    } finally {
        //await closeDB_Connection()
    }
}
export async function updateLastName(data: { uuid: string, lastName: string }) {
    try {
        //await openDB_Connection()
        const sql = 'UPDATE users SET family_name = (?) where uuid = (?)'
        const values = [data.lastName, data.uuid]
        const [result, fields] = await POOL.execute(sql, values)
        console.log(result)
        //@ts-ignore
        if (result.changedRows === 0) {
            throw new Error("No row matches")
        }
        //console.log(fields)
        //await closeDB_Connection()
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    } finally {
        //await closeDB_Connection()
    }
}
export async function updateBirthdate(data: { uuid: string, birthdate: Date }) {
    console.log(data)
    try {
        //await openDB_Connection()
        const sql = 'UPDATE users SET birthdate = (?) where uuid = (?)'
        const values = [data.birthdate, data.uuid]
        const [result, fields] = await POOL.execute(sql, values)
        console.log(result)
        //@ts-ignore
        if (result.changedRows === 0) {
            throw new Error("No row matches")
        }
        //console.log(fields)
        //await closeDB_Connection()
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    } finally {
        //await closeDB_Connection()
    }
}
export async function updateState(data: { uuid: string, state: string }) {
    console.log(data)
    try {
        //await openDB_Connection()
        const sql = 'UPDATE users SET state = (?) where uuid = (?)'
        const values = [data.state, data.uuid]
        const [result, fields] = await POOL.execute(sql, values)
        console.log(result)
        //@ts-ignore
        if (result.changedRows === 0) {
            throw new Error("No row matches")
        }
        //console.log(fields)
        //await closeDB_Connection()
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    } finally {
        //await closeDB_Connection()
    }
}
export async function update(data: { uuid: string, state: string }) {
    console.log(data)
    try {
        //await openDB_Connection()
        const sql = 'UPDATE users SET state = (?) where uuid = (?)'
        const values = [data.state, data.uuid]
        const [result, fields] = await POOL.execute(sql, values)
        console.log(result)
        //@ts-ignore
        if (result.changedRows === 0) {
            throw new Error("No row matches")
        }
        //console.log(fields)
        //await closeDB_Connection()
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    } finally {
        //await closeDB_Connection()
    }
}
export async function storeRecoveryCode(email: string, code: string) {
    try {
        //await openDB_Connection()
        const sql = 'INSERT INTO recovery_codes (email,code) values (?,?)'
        const values = [email, code]
        const [result, fields] = await POOL.execute(sql, values)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
    } catch (error: any) {
        console.log(error)
        throw new Error(error)
    } finally {
        //await closeDB_Connection()
    }
}

export async function getRecoveryCode(email: string) {
    try {
        //await openDB_Connection()
        const sql = 'SELECT * FROM recovery_codes where email = (?)'
        const values = [email]
        const [result, fields] = await POOL.execute(sql, values)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        return result as unknown as Array<{ id: number, email: string, code: string, is_used: number, created_at: Date }>
    } catch (error: any) {
        console.log(error)
        throw new Error(error)
    } finally {
        //await closeDB_Connection()
    }
}

export async function updateRecoveryCode(data: { id: number, email: string, code: string, is_used: number, created_at: Date }) {
    try {
        //await openDB_Connection()
        const sql = 'UPDATE recovery_codes SET is_used = (?) where email = (?) and code = (?)'
        const values = [true, data.email, data.code]
        const [result, fields] = await POOL.execute(sql, values)
        console.log(result)
        //console.log(fields)
        //await closeDB_Connection()
        return "Success"
    } catch (error: any) {
        console.log(error)
        throw new Error(error)
    } finally {
        //await closeDB_Connection()
    }
}

export async function updateProfilePicture(profilePicture: string, uuid: string, role: string) {
    try {
        //await openDB_Connection()
        let sql!: string
        const values = [profilePicture, uuid]
        switch (role) {
            case 'Patient':
                sql = 'UPDATE patients SET profile_picture = (?) WHERE patient_uuid = (?)'
                break;
            case 'Representative':
                sql = 'UPDATE health_representative SET profile_picture = (?) WHERE rep_uuid = (?)'
                break;
            case 'Medic':
                sql = 'UPDATE health_professionals SET profile_picture = (?) WHERE hp_uuid = (?)'
                break;
            default:
                throw new Error('No role specified or Incorrect role')
        }

        const [result, fields] = await POOL.execute(sql, values)
        console.log(result)
        //@ts-ignore
        if (result.affectedRows === 0) {
            throw new Error("No row matches")
        }
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    } finally {
        //await closeDB_Connection()
    }
}

export const deleteUserAccount = async (account: string) => {
    try {
        //await openDB_Connection()
        const sql = 'UPDATE users SET is_access_restricted = 1, is_deleted = 1 WHERE email = (?)'
        const value = [account]
        const [result, fields] = await POOL.execute(sql, value)
        console.log(result)
        //await closeDB_Connection()
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    }
}

export const updateUserAccess = async (access:boolean, uuid:string) => {
    try{
        const sql = 'UPDATE users SET is_access_restricted = (?) WHERE uuid = (?)'
        const value = [access, uuid]
        const [result, fields] = await POOL.execute(sql, value)
        console.log(result)
    }catch(error:any){
        console.log(error)
        throw new Error(error.message)
    }
}