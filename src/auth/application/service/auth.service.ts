import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtToken, } from "../../infra/authentication/token/jwt-token";
import { UserAuthentication } from "src/user-auth-common.module.ts/domain/auth/authentication";
import { UserDto } from "src/user-auth-common.module.ts/interface/dto/user.dto";
import { UserAuthCommonRepository } from "src/user-auth-common.module.ts/infra/repository/user-auth-common.repository";
import { User } from "src/user-auth-common.module.ts/domain/user/user";
import { UserAuthCommonMapper } from "src/user-auth-common.module.ts/application/mapper/user-auth-common.mapper";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userAuthCommonMapper: UserAuthCommonMapper,
        private readonly userAuthCommonRepository: UserAuthCommonRepository
    ) { }

    /* 로그인 */
    async login(user: User, inputPassword: string): Promise<UserDto> {
        await user.loginWith(inputPassword, new Date()); // 로그인 시도
        /* 만약 패스워드가 일치한다면 해당 사용자의 기존 인증 갱신 */
        if (user.isLoginSucceeded())
            await this.updateUserAuthentication(user);
        /* 로그인에 성공했으므로 마지막 갱신일, 실패했으면 실패 로직에 따른 결과 업데이트 */
        await this.userAuthCommonRepository.save(user);
        console.log('GITHUB')
        return this.userAuthCommonMapper.toDto(user);
    }

    async logout(id: number): Promise<void> {
        const user = await this.userAuthCommonRepository.findById(id);
        user.logout(new Date());
        await this.userAuthCommonRepository.save(user);
    }

    async createAuthentication(email: string): Promise<UserAuthentication> {
        const [accessToken, refreshToken] = await Promise.all([
            this.createAccessToken(email),
            this.createRefreshToekn(email)
        ]);
        return UserAuthentication.createWith(accessToken, refreshToken);
    }

    /* 
        RefreshToken의 마지막 갱신일을 검사해 일정 기간 이상 지났으면 RefreshToken 갱신
        마지막 갱신일이 얼마 지나지 않았으면 AccessToken만 갱신해서 Return
    */
    async refreshAuthentication(userAuthentication: UserAuthentication, email: string): Promise<UserAuthentication> {
        userAuthentication.updateClientAuthentication(await this.createAccessToken(email)); // AccessToken
        if (userAuthentication.isNeededUpdate(new Date())) // RefreshToken의 업데이트가 필요하다면
            userAuthentication.updateRefreshAuthentication(await this.createRefreshToekn(email), new Date());
        return userAuthentication
    }

    /* 갱신한 인증을 user 객체에 변경 */
    async updateUserAuthentication(user: User): Promise<void> {
        const refreshedAuthentication = 
            await this.refreshAuthentication(user.getAuthentication(), user.getEmail());
        user.updateAuthentication(refreshedAuthentication);
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