import { Handler, Request, Response } from 'express'
import { getProductCatalog, getRepresentativeInformation, storeRepresentativeInDB, updateProductCatalogItem, updateProductsCatalog } from "../utils/DAO/Representative/DaoRepresentative"
import { Representative, Product } from '../models/RepresentativeModel/Representative'

export const handleRepresentativeInformation = async (account: string) => {
    try {
        const result = await getRepresentativeInformation(account)
        return result
    } catch (error: any) {
        console.log(error.message)
        console.log("Error in Patient Information on Patient Controller")
    }
}

export const registerRepresentativeHandler: Handler = async (req: Request, res: Response) => {
    const data = req.body
    const rep = new Representative()
    rep.createRepresentative(data)
    rep.setIsAccessRestricted(false)
    rep.setScore(0)
    //rep.setLaboratory("Dexter's Laboratory")
    console.log(rep)
    try {
        await storeRepresentativeInDB(rep)
    } catch (error: any) {
        console.log(error)
        return res.status(500).json({
            error: "Representative Register",
            message: "Unexpected error trying to store representative in database",
            sqlMessage: error
        })
    }
    return res.status(201).json({
        message: "Representative Created",
        uuid: rep.getUUID()
    })
}

export const handleProductCatalog: Handler = async(req: Request, res: Response) => {
    const {uuid} = req.method === 'GET' ? req.query : req.body
    const product:Product = req.body.product
    if(!uuid){
        return res.status(400).json({
            error: "Product Catalog",
            message: "No UUID Provided"
        })
    }
    if(!product && req.method === 'PATCH'){
        return res.status(400).json({
            error: "Product Catalog",
            message: "No Product Item Provided"
        })
    }
    try {
        if(req.method === 'GET'){
            const result = await getProductCatalog(uuid)
            return res.status(200).json(result)
        }if(req.method === 'PATCH'){
            const result:any = await getProductCatalog(uuid)
            for(const element in result){
                for(let index = 0; index < result[element].length; index++){
                    console.log(result[element][index])
                    if(result[element][index].id === product.id){
                        result[element][index] = product
                    }
                }
                await updateProductsCatalog(result.product_catalog, uuid)
            }
            return res.status(200).json({
                message:"Successfully Updated Catalog Item"
            })
        }
    } catch (error:any) {
        console.log(error)
        return res.status(500).json(error.message)
    }   

} 