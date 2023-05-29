import { Test } from "@nestjs/testing";
import { UserMapper } from "src/user/application/mapper/user.mapper"
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ErrorMessage } from "src/common/exception/enum/error-message.enum";
import { LoginUserStub, UserStub } from "test/unit/user-auth-common/stub/user.stub";
import { USER_STATUS } from "src/user/domain/enum/user-status.enum";
import { AuthServiceMockProvider } from "test/unit/auth/mock/auth-service.mock";
import { UserAuthenticationStub } from "test/unit/auth/stub/authentication.stub";
import { AuthService } from "src/auth/application/service/auth.service";
import { UserAuthCommonRepository } from "src/user-auth-common.module.ts/infra/repository/user-auth-common.repository";
import { UserService } from "src/user/application/service/user.service";
import { EmailFailUserStub, PasswordFailUserStub, ValidateSuccessUserStub } from "test/unit/user-auth-common/stub/validate-user.stub";
import { JwtService } from "@nestjs/jwt";
import { UserAuthCommonMapper } from "src/user-auth-common.module.ts/application/mapper/user-auth-common.mapper";
import { UserAuthCommonRepoMockProvider } from "test/unit/user-auth-common/mock/repository/user-auth-respository.mock";

describe('유저 서비스(UserService)', () => {
    let userService: UserService;
    let userAuthCommonRepository: UserAuthCommonRepository;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthServiceMockProvider,
                UserAuthCommonMapper,
                UserMapper,
                JwtService,
                UserService,
                AuthService,
                UserAuthCommonRepoMockProvider
            ]
        }).compile();
        userService = module.get(UserService);
        userAuthCommonRepository = module.get(UserAuthCommonRepository);
    })

    describe('register()', () => {

        it('이미 존재하는 이메일이면 회원가입에 실패', async () => {
            jest.spyOn(userAuthCommonRepository, 'findByEmail').mockResolvedValueOnce(UserStub());
            await expect(userService.register(ValidateSuccessUserStub)).rejects
                .toThrowError(new ConflictException(ErrorMessage.DUPLICATED_EMAIL))
        });

        it('이메일 형식이 유효하지 않으면 회원가입 실패', async () => {
            jest.spyOn(userAuthCommonRepository, 'findByEmail').mockResolvedValueOnce(null);
            await expect(userService.register(EmailFailUserStub)).rejects
                .toThrowError(new BadRequestException(ErrorMessage.EMAIL_VALIDATE))
        });

        it('비밀번호 형식이 유효하지 않으면 회원가입 실패', async () => {
            jest.spyOn(userAuthCommonRepository, 'findByEmail').mockResolvedValueOnce(null);
            await expect(userService.register(PasswordFailUserStub)).rejects
                .toThrowError(new BadRequestException(ErrorMessage.PASSWORD_VALIDATE))
        });

        it('모든 유효성 검사에 통과하면 회원가입 성공', async () => {
            jest.spyOn(userAuthCommonRepository, 'findByEmail').mockResolvedValueOnce(null);
            jest.spyOn(userAuthCommonRepository, 'save').mockResolvedValueOnce(UserStub())
            const user = UserStub();
            user.registered().withId((await userAuthCommonRepository.save(user)).getId());
            expect(user.getStatus()).toBe(USER_STATUS.LOGINED);
        });
    });

    describe('leave()', () => {
        it('비밀번호가 일치하지 않으면 탈퇴가 되지 않는다', async () => {
            jest.spyOn(userAuthCommonRepository, 'findById').mockResolvedValue(UserStub());
            await expect(userService.leave(1, {password: 'Test1234'})).rejects
            .toThrowError(new UnauthorizedException(ErrorMessage.LOGIN_FAILED));
        });

        it('탈퇴를 하면 상태가 LEAVED가 되어야 한다', async () => {
            const user = LoginUserStub();
            expect(user.getStatus()).toBe(USER_STATUS.LOGINED);
            await user.leaved('Test123456');
            expect(user.getStatus()).toBe(USER_STATUS.LEAVED);
        });
    });

    describe('changePassword()', () => {
        let result;
        beforeEach(() => {
            jest.spyOn(userAuthCommonRepository, 'findById')
            .mockResolvedValueOnce(UserStub());
        });

        it('본인 비밀번호 확인에 실패하면 비밀번호를 변경할 수 없다', async () => {
            result = async () =>  userService.changePassword(1, { 
                oldPassword: 'Test1234', newPassword: 'Test1234566'
            })
            await expect(result).rejects.toThrowError(new UnauthorizedException(ErrorMessage.LOGIN_FAILED));
        });

        it('본인 비밀번호 확인에 성공해도 변경하려는 비밀번호와 기존 비밀번호 동일하면 변경 불가', async () => {
            result = async () => userService.changePassword(1, {
                oldPassword: 'Test123456', newPassword: 'Test123456'
            });
            await expect(result).rejects.toThrowError(new ConflictException(ErrorMessage.DUPLICATED_PASSWORD));
        });

        it('비밀번호 변경 전 모든 검사에 통과하면 비밀번호 변경에 성공하고 새로운 인증 갱신', async () => {
            const user = LoginUserStub();
            const updateTime = new Date('March 19, 1998 03:19:00');
            await user.changePassword('Test123456', 'Test1234567', updateTime);
            user.updateAuthentication(UserAuthenticationStub());
            await expect(user.getPassword().comparePassword('Test1234567')).resolves.toBe(true);
            expect(user.getAuthentication().getClientAuthentication()).toBe('accessToken')
        })
    })
})