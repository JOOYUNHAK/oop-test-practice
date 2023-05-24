import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { RegisterDto } from "src/user/interface/dto/register.dto";
import { UserMapper } from "../mapper/user.mapper";
import { User } from "src/user/domain/user";
import { UserRepository } from "src/user/infra/database/repository/user.repository";
import { LoginDto } from "src/user/interface/dto/login.dto";
import { AuthService } from "src/auth/application/service/auth.service";
import { ChangePasswordDto } from "src/user/interface/dto/change-password.dto";
import { UserAuthentication } from "src/auth/domain/authentication/authentication";
import { UserDto } from "src/user/interface/dto/user.dto";
import { LeaveRequestDto } from "src/user/interface/dto/leave-request.dto";

@Injectable()
export class UserService {
    constructor(
        private readonly userMapper: UserMapper,
        private readonly userRepository: UserRepository,
        private readonly authService: AuthService,
    ) { }
    /* 회원가입 */
    async register(registerDto: RegisterDto) {
        await this.emailDuplicateCheck(registerDto.email); // Email 중복 체크
        const user: User = await this.userMapper.dtoToDomain(registerDto); 
        /* Entity로 변경 후 저장 */
        user.registered()
            .withId( (await this.userRepository.save(user)).getId() );
        return this.userMapper.toDto(user);
    }

    /* 로그인 */
    async login(loginDto: LoginDto): Promise<UserDto> { 
        /* 이메일의 유효성을 검사하며 저장소로부터 User를 가져온다 */
        const user = await this.notFoundEmailErrorOrUser(loginDto.email);
        await user.loginWith(loginDto.password, new Date()); // 로그인 시도
        /* 만약 패스워드가 일치한다면 해당 사용자의 기존 인증 갱신 */
        if( user.isLoginSucceeded() ) 
            user.updateAuthentication(await this.refreshAuthentication(user))
        /* 로그인에 성공했으므로 마지막 갱신일, 실패했으면 실패 로직에 따른 결과 업데이트 */
        await this.userRepository.save(user);
        user.statusCheck(); // 비밀번호를 틀렸을 경우 Throw Error
        return this.userMapper.toDto(user);
    }

    /* 이메일 중복 검사 */
    async emailDuplicateCheck(email: string): Promise<void> {
        if ( await this.findUserByEmail(email) )
            throw new ConflictException('Duplicated Email');
    } 

    /* 이메일을 못찾으면 Throw Error or UserEntity  */
    async notFoundEmailErrorOrUser(email: string): Promise<User> {
        const user = await this.findUserByEmail(email);
        if( !user )
            throw new NotFoundException('Something Error Id Or Password');
        return user;
    }

    async findUserByEmail(email: string): Promise<User> {
        return await this.userRepository.findByEmail(email);
    }

    async logout(id: number): Promise<void> {
        const user = await this.findUserById(id);
        user.logout(new Date());
        await this.userRepository.save(user);
    }

    async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<UserDto> {
        const user: User = await this.findUserById(id);
        /* 비밀번호 변경 수행 */
        await user.changePassword(changePasswordDto.oldPassword, changePasswordDto.newPassword, new Date());
        /* 비밀번호 변경에 성공하면 인증 갱신 */
        user.updateAuthentication(await this.refreshAuthentication(user)); 
        await this.userRepository.save(user);
        return this.userMapper.toDto(user)
    }

    async findUserById(id: number): Promise<User> {
        return await this.userRepository.findById(id);
    }

    /* 사용자의 기존 인증을 갱신시키기위해 AuthService 호출하는 함수 */
    async refreshAuthentication(user: User): Promise<UserAuthentication> {
        return await this.authService
            .updateAuthentication(user.getAuthentication(), user.getEmail());
    }

    async leave(id: number, leaveRequestDto: LeaveRequestDto) {
        const user: User = await this.findUserById(id);
        await user.leaved(leaveRequestDto.password);
        await this.userRepository.delete(id)
    }
} 