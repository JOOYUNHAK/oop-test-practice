import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { AuthService } from "src/auth/application/service/auth.service";
import { ErrorMessage } from "src/common/exception/enum/error-message.enum";
import { UserAuthCommonMapper } from "src/user-auth-common.module.ts/application/mapper/user-auth-common.mapper";
import { UserAuthCommonRepository } from "src/user-auth-common.module.ts/infra/repository/user-auth-common.repository";
import { USER_STATUS } from "src/user/domain/enum/user-status.enum";
import { HaveExpiredAuthenticationUser, LoginBlockedUserStub, LoginUserStub, UserStub } from "test/unit/user-auth-common/stub/user.stub";
import { UserAuthenticationStub } from "../../stub/authentication.stub";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/user-auth-common.module.ts/domain/user/user";
import { ValidateSuccessUserStub } from "test/unit/user-auth-common/stub/validate-user.stub";

describe('인증 서비스(AuthService)', () => {
    let authService: AuthService;    let userAuthCommonRepository: UserAuthCommonRepository;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtService,
                AuthService,
                UserAuthCommonMapper,
                {
                    provide: getRepositoryToken(User),
                    useValue: {}
                },
                UserAuthCommonRepository
            ]
        }).compile();

        authService = module.get(AuthService);
        userAuthCommonRepository = module.get(UserAuthCommonRepository);
    });

    describe('login()', () => {
        it('가입되지 않은 이메일이면 로그인 실패', async () => {
            jest.spyOn(userAuthCommonRepository, 'findByEmail').mockResolvedValueOnce(null);
            await expect(authService.login(ValidateSuccessUserStub)).rejects
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

    describe('createAuthentication()', () => {
        it('사용자에게 새로운 AccessToken과 RefreshToken을 발급하여 돌려준다',async () => {
            jest.spyOn(authService, 'createAccessToken').mockResolvedValueOnce('accessToken');
            jest.spyOn(authService as any, 'createRefreshToekn').mockResolvedValueOnce('refreshToken');
            const result = await authService.createAuthentication('');
            expect(result.getClientAuthentication()).toBe('accessToken');
        })
    });

    describe('refreshAuthentication()', () => {
        it('사용자의 RefreshToken이 만료되지 않았으면 RefreshToken은 갱신하지 않는다', () => {
            const user = LoginUserStub();
            const result = user.getAuthentication().isNeededUpdate(new Date());
            expect(result).toBe(false);
        });

        it('사용자의 RefreshToken이 만료되었으면 같이 갱신한다', () => {
            const user = HaveExpiredAuthenticationUser();
            const result = user.getAuthentication().isNeededUpdate(new Date());
            expect(result).toBe(true);
        });
    })

    describe('updateUserAuthentication()', () => {
        it('사용자의 기존 인증을 갱신된 인증으로 변경한다', async () => {
            const user = LoginUserStub();
            expect(user.getClientAuthentication()).toBe('accessToken');

            jest.spyOn(authService, 'createAccessToken').mockResolvedValueOnce('newAccessToken');
            jest.spyOn(authService as any, 'createRefreshToekn').mockResolvedValueOnce('newRefreshToken');
            const refreshedAuthentication = await authService.refreshAuthentication(
                user.getAuthentication(), user.getEmail()
            );
            user.updateAuthentication(refreshedAuthentication);
            expect(user.getClientAuthentication()).toBe('newAccessToken');
            expect(user.getAuthentication()).toEqual(refreshedAuthentication);
        });
    })
})