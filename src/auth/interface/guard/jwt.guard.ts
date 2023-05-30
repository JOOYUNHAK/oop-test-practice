import { AuthGuard } from "@nestjs/passport";
import { Injectable, UnauthorizedException, ExecutionContext, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/user-auth-common.module.ts/domain/user/user";
import { UserAuthCommonRepository } from "src/user-auth-common.module.ts/infra/repository/user-auth-common.repository";
import { ErrorMessage } from "src/common/exception/enum/error-message.enum";
import { AuthService } from "src/auth/application/service/auth.service";

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    constructor(
        private readonly jwtService: JwtService,
        private readonly authService: AuthService,
        private readonly userAuthCommonRepository: UserAuthCommonRepository
    ) { super() }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { authorization } = request.headers;
        if( !authorization ) throw new NotFoundException(ErrorMessage.NO_AUTHENTICATION_IN_HEADER);

        request.user = await this.validateToken(authorization.replace('Bearer ', ''));
        return true;
    }

    async validateToken(accessToken: string) {
        /* 토큰을 디코드 못해도 사용자 Error  */
        const payload = this.jwtService.decode(accessToken);
        if( !payload ) throw new NotFoundException(ErrorMessage.NO_EXIST_USER_IN_AUTHENTICATION);
        
        const user = await this.userAuthCommonRepository.findByEmail(payload['email']);
        if(!user) throw new NotFoundException(ErrorMessage.LOGIN_FAILED)
        
        this.userStatusCheck(user);

        try {
            this.jwtService.verify(accessToken, { secret: process.env.JWT_TOKEN_SECRET});
            return { id: user.getId() };
        } catch(error) {
            await this.authService.logout(user.getId()); // 토큰시간 만료되었으면 로그아웃
            throw new UnauthorizedException(ErrorMessage.AUTHENTICATION_EXPIRED);
        }
    }

    /* 중복 로그아웃 및 토큰에 해당하는 email 사용자 없는 경우 */
    userStatusCheck(user: User) {
        if( user.getStatus() === 'LOGOUTED')
            throw new UnauthorizedException(ErrorMessage.AUTHENTICATION_EXPIRED);
        if( !user )
            throw new NotFoundException(ErrorMessage.NO_EXIST_USER_IN_AUTHENTICATION);
    }
}