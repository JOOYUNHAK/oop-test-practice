import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtToken,  } from "../../infra/authentication/token/jwt-token";
import { UserAuthentication } from "src/auth/domain/authentication/authentication";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService
    ) {}
    async createAuthentication(email: string): Promise<UserAuthentication> {
        const [accessToken, refreshToken] = await Promise.all([
            this.createAccessToken(email),
            this.createRefreshToekn(email)
        ]);
        return UserAuthentication.createWith(accessToken, refreshToken );
    }
 
    /* 
        RefreshToken의 마지막 갱신일을 검사해 일정 기간 이상 지났으면 RefreshToken 갱신
        마지막 갱신일이 얼마 지나지 않았으면 AccessToken만 갱신해서 Return
    */
    async updateAuthentication(userAuthentication: UserAuthentication, email: string): Promise<UserAuthentication> {
        userAuthentication.updateClientAuthentication( await this.createAccessToken(email) ); // AccessToken
        if( userAuthentication.isNeededUpdate(new Date()) ) // RefreshToken의 업데이트가 필요하다면
            userAuthentication.updateRefreshAuthentication( await this.createRefreshToekn(email), new Date() );
        return userAuthentication
    }
 
    async createAccessToken(email: string): Promise<string> {
        return this.jwtService.signAsync(
            JwtToken.createAccessTokenPayload(email),
            JwtToken.getAccessTokenOption() 
        );
    }

    private async createRefreshToekn(email: string): Promise<string> {
        return this.jwtService.signAsync(
            JwtToken.createRefreshTokenPayload(email),
            JwtToken.getRefreshTokenOption()
        );
    }
}