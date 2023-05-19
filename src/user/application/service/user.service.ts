import { ConflictException, Injectable } from "@nestjs/common";
import { RegisterDto } from "src/user/interface/dto/register.dto";
import { UserMapper } from "../mapper/user.mapper";
import { User } from "src/user/domain/user";
import { UserRepository } from "src/user/infra/database/repository/user.repository";

@Injectable()
export class UserService{
    constructor(
        private readonly userMapper: UserMapper,
        private readonly userRepository: UserRepository
    ) {}
    /* 회원가입 */
    async register(registerDto: RegisterDto) {
        await this.emailDuplicateCheck(registerDto.email); // Email 중복 체크
        const user: User = await this.userMapper.dtoToDomain(registerDto);
    }

    /* 이메일 중복 검사 */
     async emailDuplicateCheck(email: string): Promise<void> {
        if( !await this.userRepository.findByEmail(email) ) 
            throw new ConflictException('Duplicated Email');
    }
}