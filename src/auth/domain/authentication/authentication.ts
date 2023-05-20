import { IAuthentication } from "./iauthentication";

export class UserAuthentication {
    constructor( private readonly type: IAuthentication) {};
    
    getType(): IAuthentication { return this.type; };
    
    /* 인증 타입으로 Session이나 Token등 여러가지 올 수 있게 하기 위해 */
    static createWith (authenticationType: IAuthentication) {
        return new UserAuthentication(authenticationType)
    }
}

