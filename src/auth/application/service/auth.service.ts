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
        return UserAuthentication.createWith(new JwtToken(accessToken, refreshToken, new Date()));
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