import { ConflictException, Injectable } from "@nestjs/common";
import { RegisterDto } from "src/user/interface/dto/register.dto";
import { UserMapper } from "../mapper/user.mapper";
import { User } from "src/user-auth-common.module.ts/domain/user/user";
import { AuthService } from "src/auth/application/service/auth.service";
import { ChangePasswordDto } from "src/user/interface/dto/change-password.dto";
import { UserDto } from "src/user-auth-common.module.ts/interface/dto/user.dto";
import { LeaveRequestDto } from "src/user/interface/dto/leave-request.dto";
import { UserAuthCommonRepository } from "src/user-auth-common.module.ts/infra/repository/user-auth-common.repository";
import { UserAuthCommonMapper } from "src/user-auth-common.module.ts/application/mapper/user-auth-common.mapper";

@Injectable()
export class UserService {
    constructor(
        private readonly userMapper: UserMapper,
        private readonly userAuthCommonMapper: UserAuthCommonMapper,
        private readonly userAuthCommonRepository: UserAuthCommonRepository,
        private readonly authService: AuthService,
    ) { }
    /* 회원가입 */
    async register(registerDto: RegisterDto) {
        await this.emailDuplicateCheck(registerDto.email); // Email 중복 체크
        const user: User = await this.userMapper.dtoToDomain(registerDto); 
        /* Entity로 변경 후 저장 */
        user.registered()
            .withId( (await this.userAuthCommonRepository.save(user)).getId() );
        return this.userAuthCommonMapper.toDto(user);
    }

    /* 이메일 중복 검사 */
    async emailDuplicateCheck(email: string): Promise<void> {
        if ( await this.userAuthCommonRepository.findByEmail(email) )
            throw new ConflictException('Duplicated Email');
    } 

    async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<UserDto> {
        const user: User = await this.userAuthCommonRepository.findById(id);
        /* 비밀번호 변경 수행 */
        await user.changePassword(changePasswordDto.oldPassword, changePasswordDto.newPassword, new Date());
        /* 비밀번호 변경에 성공하면 인증 갱신 */
        await this.authService.updateUserAuthentication(user);
        await this.userAuthCommonRepository.save(user);
        return this.userAuthCommonMapper.toDto(user)
    }

    async leave(id: number, leaveRequestDto: LeaveRequestDto) {
        const user: User = await this.userAuthCommonRepository.findById(id);
        await user.leaved(leaveRequestDto.password);
        await this.userAuthCommonRepository.delete(id)
    }
} 