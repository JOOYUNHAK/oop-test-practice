import { Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UserService } from "src/user/application/service/user.service";
import { JwtTokenPayload } from "../payload/jwt-token.payload";
import { ModuleRef } from "@nestjs/core";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements OnModuleInit {
    private userService: UserService;
    constructor (
        private moduleRef: ModuleRef
    ) {
        super({
            secretOrKey: process.env.JWT_TOKEN_SECRET,
            ignoreExpiration: false,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }
    onModuleInit() {
        this.userService = this.moduleRef.get(UserService, { strict: false} )
    }
    async validate(payload: JwtTokenPayload) {
        const user = await this.userService.findUserByEmail(payload.email);
        if( user.getStatus() == 'LOGOUTED' )
            throw new UnauthorizedException('Login Again Please')
        /* 토큰에 있는 이메일로 사용자 찾고 없으면 Throw Error */
        if(!user)
            throw new NotFoundException('Something Error');   

        return { id: user.getId() };
    }
}