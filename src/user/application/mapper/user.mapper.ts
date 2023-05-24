import { Injectable } from "@nestjs/common";
import { AuthService } from "src/auth/application/service/auth.service";
import { LoginBlockInfo } from "src/user/domain/login-block-info";
import { User } from "src/user/domain/user";
import { Email } from "src/user/domain/user-email";
import { Password } from "src/user/domain/user-password";
import { RegisterDto } from "src/user/interface/dto/register.dto";
import { UserDto } from "src/user/interface/dto/user.dto";

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

    /* 도메인 모델을 사용자에게 전달할 Dto로 */
    toDto(user: User): UserDto {
        return {
            id: user.getId(),
            accessToken: user.getClientAuthentication()
        }
    }
}