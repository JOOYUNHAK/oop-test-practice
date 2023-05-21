import { AuthGuard } from "@nestjs/passport";
import { Injectable, UnauthorizedException, ExecutionContext, OnModuleInit, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ModuleRef } from "@nestjs/core";
import { UserService } from "src/user/application/service/user.service";
import { UserEntity } from "src/user/domain/entity/user.entity";

@Injectable()
export class JwtGuard extends AuthGuard('jwt') implements OnModuleInit {
    private userService: UserService
    constructor(
        private readonly jwtService: JwtService,
        private readonly moduleRef: ModuleRef
    ) { super() }

    onModuleInit() { 
        this.userService = this.moduleRef.get(UserService, { strict: false} ) 
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { authorization } = request.headers;
        if( !authorization ) throw new NotFoundException('Something Error');

        request.user = await this.validateToken(authorization.replace('Bearer ', ''));
        return true;
    }

    async validateToken(accessToken: string) {
        /* 토큰을 디코드 못해도 사용자 Error  */
        const payload = this.jwtService.decode(accessToken);
        if( !payload ) throw new NotFoundException('Not Found User')
        
        const user: UserEntity = await this.userService.notFoundEmailErrorOrUser(payload['email']);
        this.userStatusCheck(user);

        try {
            this.jwtService.verify(accessToken, { secret: process.env.JWT_TOKEN_SECRET});
            return { id: user.getId() };
        } catch(error) {
            await this.userService.logout(user.getId()); // 토큰시간 만료되었으면 로그아웃
            throw new UnauthorizedException('Token Expired');
        }
    }

    /* 중복 로그아웃 및 토큰에 해당하는 email 사용자 없는 경우 */
    userStatusCheck(user: UserEntity) {
        if( user.getStatus() === 'LOGOUTED')
            throw new UnauthorizedException('Login Again Please');
        if( !user )
            throw new NotFoundException('Not Found User');
    }
}