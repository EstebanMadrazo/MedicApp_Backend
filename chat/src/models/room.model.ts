export class Room {
    id?: number
    session_id!: string
    pacient_uuid!: string
    hp_uuid!: string
    created_at!: Date
    expires_at!: Date
    is_expired!: boolean

    createRoom(data: Room):void{
        this.session_id = data.session_id
        this.pacient_uuid = data.pacient_uuid
        this.hp_uuid = data.hp_uuid
        this. created_at = data.created_at
        this.expires_at = data.expires_at
        this.is_expired = data.is_expired
    }

    
    
    public getId() : any {
        return this.id
    }
    
    
    public setSession(session_id : string):void {
        this.session_id = session_id;
    }
    
    
    public getSession_id() : string {
        return this.session_id
    }
    
    
    
    public setPacient_uuid(pacient_uuid : string):void {
        this.pacient_uuid = pacient_uuid;
    }

    
    public getPacient_uuid() : string {
        return this.pacient_uuid
    }

    
    public setHp_uuid(hp_uuid : string):void {
        this.hp_uuid = hp_uuid;
    }

    
    public getHp_uuid() : string {
        return this.hp_uuid
    }

    
    public setCreated_at(created_at : Date):void {
        this.created_at = created_at;
    }
    
    
    public getCreated_at() : Date {
        return this.created_at
    }

    
    public setExpires_at(expires_at : Date):void {
        this.expires_at = expires_at;
    }

    
    public getExpires_at() : Date {
        return this.expires_at
    }

    
    public setIs_expired(is_expired : boolean):void {
        this.is_expired = is_expired
    }

    
    public getIsExpired() :boolean {
        return this.is_expired
    }
    
    
    
    
    
    
    
    
    
    

}