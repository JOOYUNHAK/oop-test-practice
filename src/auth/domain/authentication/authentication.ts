import { IAuthentication } from "./iauthentication";

export class UserAuthentication {
    constructor( private userId: number, private readonly type: IAuthentication) {};
    
    getType(): IAuthentication { return this.type; };
    getId(): number { return this.userId; };
    isNeededUpdate(): boolean { return this.type.isNearingExpirationTime() } // 인증 타입에게 업데이트가 필요한지 매세지

    /* AccessToken, RefreshToken 갱신해달라고 매세지 */
    updateClientAuthentication(clientAuthentication: string) { this.type.updateClientAuthentication(clientAuthentication); }
    updateRefreshAuthentication(refreshAuthentication: string) { this.type.updateRefreshAuthentication(refreshAuthentication); }
    
    /* 인증 타입으로 Session이나 Token등 여러가지 올 수 있게 하기 위해 */
    static createWith (authenticationType: IAuthentication) {
        return new UserAuthentication(null, authenticationType)
    }
}

