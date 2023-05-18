import { Injectable } from "@nestjs/common";
import { User } from "src/user/domain/user";
import { Email } from "src/user/domain/user-email";
import { Password } from "src/user/domain/user-password";
import { RegisterDto } from "src/user/interface/dto/register.dto";

@Injectable()
export class UserMapper {
    /* Dto를 도메인 객체로 변환 */
    async dtoToDomain(registerDto: RegisterDto): Promise<User> {
        return new User(
            Email.create(registerDto.email),
            await Password.create(registerDto.password, false),
            new Date(),
        );
    }
}