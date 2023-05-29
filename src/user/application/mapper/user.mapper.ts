import { Injectable } from "@nestjs/common";
import { AuthService } from "src/auth/application/service/auth.service";
import { LoginBlockInfo } from "src/user-auth-common.module.ts/domain/user/login-block-info";
import { User } from "src/user-auth-common.module.ts/domain/user/user";
import { Email } from "src/user-auth-common.module.ts/domain/user/user-email";
import { Password } from "src/user-auth-common.module.ts/domain/user/user-password";
import { RegisterDto } from "src/user/interface/dto/register.dto";

@Injectable()
export class UserMapper {
    constructor(
        private readonly authService: AuthService
    ) {}
    /* Dto를 도메인 객체로 변환 */
    async dtoToDomain(registerDto: RegisterDto): Promise<User> {
        const email = Email.create(registerDto.email); 
        /* 비밀번호 유효성 검사와 인증을 얻어 새로운 사용자로 변환 */
        const [encryptedPassword, authentication] = await Promise.all([
            Password.create(registerDto.password),
            this.authService.createAuthentication(registerDto.email)
        ]);
        return new User(
            null,
            email,
            encryptedPassword,
            authentication,
            new Date(),
            new LoginBlockInfo(0, null),
            null,
        );
    }
}