import { BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm";
import { AuthService } from "src/auth/application/service/auth.service"
import { ErrorMessage } from "src/common/exception/enum/error-message.enum";
import { UserAuthCommonMapper } from "src/user-auth-common.module.ts/application/mapper/user-auth-common.mapper";
import { User } from "src/user-auth-common.module.ts/domain/user/user";
import { Password } from "src/user-auth-common.module.ts/domain/user/user-password";
import { UserAuthCommonRepository } from "src/user-auth-common.module.ts/infra/repository/user-auth-common.repository";
import { UserMapper } from "src/user/application/mapper/user.mapper"
import { UserAuthenticationStub } from "test/unit/auth/stub/authentication.stub";
import { EmailFailUserStub, PasswordFailUserStub, ValidateSuccessUserStub } from "test/unit/user-auth-common/stub/validate-user.stub";

describe('userMapper', () => {
    let userMapper: UserMapper;
    let authService: AuthService;

    beforeAll( async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserMapper,
                JwtService,
                UserAuthCommonMapper,
                {
                    provide: getRepositoryToken(User),
                    useValue: {}
                },
                UserAuthCommonRepository,
                AuthService
            ]
        }).compile();
        
        userMapper = module.get(UserMapper);
        authService = module.get(AuthService);
    });

    describe('dtoToDomain()', () => {
        it('이메일이 유효하지 않으면 오류 반환', async () => {
            await expect(userMapper.dtoToDomain(EmailFailUserStub)).rejects
            .toThrowError(new BadRequestException(ErrorMessage.EMAIL_VALIDATE))
        });

        it('비밀번호가 유효하지 않으면 오류 반환', async () => {
            await expect(userMapper.dtoToDomain(PasswordFailUserStub)).rejects
            .toThrowError(new BadRequestException(ErrorMessage.PASSWORD_VALIDATE))
        });

        it('이메일과 비밀번호 유효검사에 통과하면 User 객체로 변환', async () => {
            jest.spyOn(Password, 'create').mockResolvedValueOnce(new Password('newPassword'));
            jest.spyOn(authService, 'createAuthentication').mockResolvedValueOnce(UserAuthenticationStub());
            const user = await userMapper.dtoToDomain(ValidateSuccessUserStub);
            expect(user).toBeInstanceOf(User);
            expect(user.getPassword().getValue()).toBe('newPassword');
            expect(user.getAuthentication().getClientAuthentication()).toBe('accessToken');
        })
    });
})