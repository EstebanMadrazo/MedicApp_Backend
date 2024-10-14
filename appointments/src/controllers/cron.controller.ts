import axios from 'axios'
import { getReviewsFromSubject } from '../utils/DAO/dao.utils.ts'


interface User {
    uuid: string,
    role: string
}
interface UpdateScore{
    total_score:number,
    total_rows: number
}
export const handleScoreUpdate = async () => {
    try {
        const response = await axios.get('http://localhost:3000/user/getUsers')
        const users = response.data
        users.forEach(async (user: User) => {
            console.log(user)
            //@ts-ignore
            const result:UpdateScore = await getReviewsFromSubject(user.uuid)
            if (result.total_score !== null) {
                console.log(result.total_score)
                const average:number = result.total_score / result.total_rows
                const resp = await axios({
                    method:'PATCH',
                    url: 'http://localhost:3000/user/updateScore',
                    data:{
                        role: user.role,
                        uuid: user.uuid,
                        score: result.total_score
                    }
                })
                console.log(resp.data)
            }
        });
    } catch (error: any) {
        console.log(error.response.data)
    }
}