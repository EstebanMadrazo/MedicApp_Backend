export const stringBuilder = (params: string[]) => {
    let constructString = ""
    try{

        for (let index = 0; index < params.length; index++) {
            constructString += '"'+params[index]+'"';
            if(index+1<params.length){
                constructString += ","
            }
        }
    }catch(error:any){
        console.log(error)
    }
    return constructString
}

export const generateDynamicSQLStatement = (specialities: string[]) => {
    let query = ''
    for (let index = 0; index < specialities.length; index++) {
        query += `JSON_CONTAINS(specialities, '{"name": "${specialities[index]}" }', '$.specialities')`
        
        if(index+1 < specialities.length){
            query += " OR "
        }
    }
    return query
}