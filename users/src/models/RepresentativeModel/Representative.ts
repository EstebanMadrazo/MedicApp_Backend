export interface Product{
    id:number
    name:string,
    description:string
}

export class Representative {
    private uuid!:string
    private productCatalog!: Product[]
    private paymentMethods!: object
    private profilePicture!: string
    private isAccessRestricted!: boolean
    private score!: number
    private laboratory!:string

    createRepresentative(data: Representative){
        this.uuid = data.uuid;
        this.productCatalog = data.productCatalog ? this.createProductCatalog(data.productCatalog) : [];
        this.paymentMethods = data.paymentMethods ?  data.paymentMethods : {};
        this.profilePicture = data.profilePicture.includes('Default') ? 
        `${process.env.PROTOCOL}${process.env.HOST_IP}:${process.env.PORT}/user/profilePicture` : data.profilePicture;
        this.isAccessRestricted = data.isAccessRestricted;
        this.score = data.score;
        this.laboratory = data.laboratory ? data.laboratory : "Not assigned";
    }
    getUUID():string{
        return this.uuid;
    }
    setUUID(uuid:string):void{
        this.uuid = uuid;
    }
    getProductCatalog():Product[]{
        return this.productCatalog;
    }
    setProductCatalog(product_catalog: Product[]):void{
        this.productCatalog = product_catalog;
    }
    getPaymentMethods():object{
        return this.paymentMethods;
    }
    setPaymentMethods(payment_methods:object):void{
        this.paymentMethods = payment_methods;
    }
    getProfilePicture():string{
        return this.profilePicture;
    }
    setProfilePicture(profile_picture: string):void{
        this.profilePicture = profile_picture;
    }
    getIsAccessRestricted():boolean{
        return this.isAccessRestricted;
    }
    setIsAccessRestricted(is_access_restricted: boolean):void{
        this.isAccessRestricted = is_access_restricted;
    }
    getScore():number{
        return this.score;
    }
    setScore(score:number):void{
        this.score = score;
    }
    /**
     * Possibly removed
     */
    getLaboratory():string{
        return this.laboratory;
    }
    setLaboratory(lab:string):void{
        this.laboratory = lab;
    }

    createProductCatalog(catalog: Product[]):Product[]{
        return catalog.map((product, index) => {
            console.log(catalog)
            return {
                ...product,
                id: index + 1,
            };
         });
    }
}