export class Message {
    id?: number
    sender!: string
    session_id!: string
    sent_at!: Date
    content!: string

    createMessage(data: Message): void{
        this.sender = data.sender
        this.session_id = data.session_id
        this.sent_at = data.sent_at
        this.content = data.content
    }

    public getId() : any {
        return this.id
    }
    
    
    
    public setSender(sender : string):void {
        this.sender = sender;
    }

    
    public getSender() : string {
        return this.sender
    }
    
    
    public setSession(session_id : string):void {
        this.session_id = session_id;
    }
    
    
    public getSession_id() : string {
        return this.session_id 
    }
    
    
    public setSend_at(sent_at : Date):void {
        this.sent_at = sent_at;
    }

    
    public getSent_at() : Date {
        return this.sent_at
    }
    
    
    public setContent(content : string) {
        this.content = content;
    }
    
    
    public getContent() : string {
        return this.content
    }
    
    
}

