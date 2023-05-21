import { AuthGuard } from "@nestjs/passport";
import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user, info: Error): any {
        if( user )
            return user;
        /* 사용자가 만료된 토큰, 중복 로그아웃 할 경우 */
        if( err )
            throw err;
        /* 토큰 시간 만료된 경우 */
        if (info.name === 'TokenExpiredError') 
            throw new UnauthorizedException('Login Again Please');
        /* 토큰의 형식, 헤더에 토큰이 없는 경우 */
        throw new BadRequestException('Something Error');
    }
}