import { ConflictException, Injectable } from "@nestjs/common";
import { RegisterDto } from "src/user/interface/dto/register.dto";
import { UserMapper } from "../mapper/user.mapper";
import { User } from "src/user/domain/user";
import { UserRepository } from "src/user/infra/database/repository/user.repository";
import { UserEntity } from "src/user/domain/entity/user.entity";

@Injectable()
export class UserService {
    constructor(
        private readonly userMapper: UserMapper,
        private readonly userRepository: UserRepository,
    ) { }
    /* 회원가입 */
    async register(registerDto: RegisterDto) {
        await this.emailDuplicateCheck(registerDto.email); // Email 중복 체크
        const user: User = await this.userMapper.dtoToDomain(registerDto); 
        /* Entity로 변경 후 저장 */
        user.registered()
            .withId( (await this.userRepository.save(this.userMapper.domainToEntity(user)) ).getId());
        return this.userMapper.toDto(user);
    }

    /* 이메일 중복 검사 */
    async emailDuplicateCheck(email: string): Promise<void> {
        if ( !await this.findUserByEmail(email) )
            throw new ConflictException('Duplicated Email');
    }

    async findUserByEmail(email: string): Promise<UserEntity> {
        return await this.userRepository.findByEmail(email);
    }
}