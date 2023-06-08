import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "src/auth/application/service/auth.service";
import { ErrorMessage } from "src/common/exception/enum/error-message.enum";
import { UserAuthCommonRepository } from "src/user-auth-common.module.ts/infra/repository/user-auth-common.repository";
import { UserDto } from "src/user-auth-common.module.ts/interface/dto/user.dto";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor( 
        private readonly authService: AuthService,
        private readonly userAuthCommonRepository: UserAuthCommonRepository
    ) {
        super({
            usernameField: 'email',
            passwordField: 'password'
        });
    };
 
    async validate(email: string, password: string): Promise<UserDto> {
        const user = await this.userAuthCommonRepository.findByEmail(email);
        if( !user ) throw new UnauthorizedException(ErrorMessage.LOGIN_FAILED);
        return await this.authService.login(user, password);
    }
}