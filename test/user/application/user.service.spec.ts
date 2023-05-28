import { Test } from "@nestjs/testing";
import { UserMapper } from "src/user/application/mapper/user.mapper"
import { UserService } from "src/user/application/service/user.service";
import { UserRepository } from "src/user/infra/database/repository/user.repository";
import { UserRepositoryMock } from "../mock/repository/user-repository.mock";
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ErrorMessage } from "src/common/exception/enum/error-message.enum";
import { EmailFailUserStub, PasswordFailUserStub } from "test/user/stub/validate/validate-fail-user.stub";
import { LoginBlockedUserStub, LoginUserStub, UserStub } from "test/user/stub/user.stub";
import { ValidateSuccessDtoStub } from "test/user/stub/validate/validate-success-dto.stub";
import { USER_STATUS } from "src/user/domain/enum/user-status.enum";
import { AuthServiceMockProvider } from "test/auth/mock/auth-service.mock";
import { UserAuthentication } from "src/auth/domain/authentication/authentication";
import { UserAuthenticationStub } from "test/auth/stub/authentication.stub";

describe('유저 서비스(UserService)', () => {
    let userService: UserService;
    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthServiceMockProvider,
                UserMapper,
                UserService,
                {
                    provide: UserRepository,
                    useValue: UserRepositoryMock()
                },
            ]
        }).compile();
        userService = module.get(UserService);
    })

    describe('register()', () => {

        it('이미 존재하는 이메일이면 회원가입에 실패', async () => {
            jest.spyOn(userService, 'findUserByEmail').mockResolvedValueOnce(UserStub());
            await expect(userService.register(ValidateSuccessDtoStub)).rejects
                .toThrowError(new ConflictException(ErrorMessage.DUPLICATED_EMAIL))
        });

        it('이메일 형식이 유효하지 않으면 회원가입 실패', async () => {
            jest.spyOn(userService, 'findUserByEmail').mockResolvedValueOnce(null);
            await expect(userService.register(EmailFailUserStub)).rejects
                .toThrowError(new BadRequestException(ErrorMessage.EMAIL_VALIDATE))
        });

        it('비밀번호 형식이 유효하지 않으면 회원가입 실패', async () => {
            jest.spyOn(userService, 'findUserByEmail').mockResolvedValueOnce(null);
            await expect(userService.register(PasswordFailUserStub)).rejects
                .toThrowError(new BadRequestException(ErrorMessage.PASSWORD_VALIDATE))
        });

        it('모든 유효성 검사에 통과하면 회원가입 성공', async () => {
            jest.spyOn(userService, 'findUserByEmail').mockResolvedValueOnce(null);
            const user = UserStub();
            user.registered().withId((UserRepositoryMock().save(user)).getId());
            expect(user.getStatus()).toBe(USER_STATUS.LOGINED);
        });
    });

    describe('login()', () => {
        it('가입되지 않은 이메일이면 로그인 실패', async () => {
            jest.spyOn(userService, 'findUserByEmail').mockResolvedValueOnce(null);
            await expect(userService.login(ValidateSuccessDtoStub)).rejects
                .toThrowError(new NotFoundException(ErrorMessage.LOGIN_FAILED))
        });

        it('비밀번호가 틀리면 로그인 실패', async () => {
            const user = UserStub();
            await user.loginWith('test123455', new Date());
            expect(user.isLoginSucceeded()).toBe(false);
            expect(user.getStatus()).toBe(USER_STATUS.DENIED);
            /* 함수내에서 오류 반환시 코드를 함수로 래핑해야함 */
            expect(() => user.statusCheck())
            .toThrowError(
                new NotFoundException(ErrorMessage.LOGIN_FAILED)
            )
        });

        it('로그인 차단되어도 5분 지나면 로그인 성공', async () => {
            const user = LoginBlockedUserStub();
            await user.loginWith('Test123456', new Date());
            expect(user.getStatus()).toBe(USER_STATUS.PASSED);
        });

        it('로그인 차단되어도 5분이 안지났으면 로그인 실패', async () => {
            const user = LoginBlockedUserStub();
            await expect(user.loginWith('Test123456', new Date('March 19, 1998 03:21:00'))).rejects
            .toThrowError(new ForbiddenException(ErrorMessage.LOGIN_COUNT_EXCEED))
            expect(user.getStatus()).toBe(USER_STATUS.BLOCKED);
        });

        it('비밀번호가 맞으면 로그인 성공', async () => {
            const user = UserStub();
            await user.loginWith('Test123456', new Date());
            expect(user.getStatus()).toBe(USER_STATUS.PASSED);
            expect(user.isLoginSucceeded()).toBe(true);
            const refreshAuthentication = UserAuthenticationStub();
            user.updateAuthentication(refreshAuthentication);
            expect(user.getStatus()).toBe(USER_STATUS.LOGINED);
            expect(user.getAuthentication()).toEqual(refreshAuthentication);
        });
    });

    describe('logout()', () => {
        it('로그아웃을 하면 상태가 LOGOUTED가 되어야 한다', () => {
            const user = LoginUserStub();
            expect(user.getStatus()).toBe(USER_STATUS.LOGINED);
            user.logout(new Date());
            expect(user.getStatus()).toBe(USER_STATUS.LOGOUTED);
        });
    });
    describe('leave()', () => {
        it('비밀번호가 일치하지 않으면 탈퇴가 되지 않는다', async () => {
            jest.spyOn(userService, 'findUserById').mockResolvedValue(UserStub());
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
            jest.spyOn(userService, 'findUserById')
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