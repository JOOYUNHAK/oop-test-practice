import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { RegisterDto } from "src/user/interface/dto/register.dto";
import { UserMapper } from "../mapper/user.mapper";
import { User } from "src/user/domain/user";
import { UserRepository } from "src/user/infra/database/repository/user.repository";
import { UserEntity } from "src/user/domain/entity/user.entity";
import { LoginDto } from "src/user/interface/dto/login.dto";
import { Email } from "src/user/domain/user-email";
import { USER_STATUS } from "src/user/domain/enum/user-status.enum";
import { AuthService } from "src/auth/application/service/auth.service";

@Injectable()
export class UserService {
    constructor(
        private readonly userMapper: UserMapper,
        private readonly userRepository: UserRepository,
        private readonly authService: AuthService
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

    /* 로그인 */
    async login(loginDto: LoginDto) { 
        /* 이메일의 유효성을 검사하며 저장소로부터 User를 가져온다 */
        const userEntity: UserEntity = await this.notFoundEmailErrorOrUser( Email.create(loginDto.email).getValue() );
        /* 가져온 User를 도메인 모델로 변경 */
        const user: User = await this.userMapper.entityToDomain(userEntity);
        await user.loginWith(loginDto.password, new Date()); // 로그인 시도
        /* 만약 패스워드가 일치한다면 해당 사용자의 기존 인증 갱신 */
        if( user.getStatus() == USER_STATUS.PASSED ) { 
            user.updateAuthentication( 
                await this.authService.updateAuthentication(user.getAuthentication(), user.getEmail().getValue())
            )
        } 
        /* 로그인에 성공했으므로 마지막 갱신일, 실패했으면 실패 로직에 따른 결과 업데이트 */
        await this.userRepository.save(this.userMapper.domainToEntity(user));
        user.statusCheck(); // 비밀번호를 틀렸을 경우 Throw Error
        return this.userMapper.toDto(user);
    }

    /* 이메일 중복 검사 */
    async emailDuplicateCheck(email: string): Promise<void> {
        if ( await this.findUserByEmail(email) )
            throw new ConflictException('Duplicated Email');
    } 

    /* 이메일을 못찾으면 Throw Error or UserEntity  */
    async notFoundEmailErrorOrUser(email: string): Promise<UserEntity> {
        const userEntity = await this.findUserByEmail(email);
        if( !userEntity )
            throw new NotFoundException('Something Error Id Or Password');
        return userEntity 
    }

    async findUserByEmail(email: string): Promise<UserEntity> {
        return await this.userRepository.findByEmail(email);
    }

    async logout(id: number): Promise<void> {
        const userEntity: UserEntity = await this.userRepository.findById(id);
        const user: User = await this.userMapper.entityToDomain(userEntity);
        user.logout(new Date());
        await this.userRepository.save(this.userMapper.domainToEntity(user));
    }
}