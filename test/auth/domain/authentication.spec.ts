import { UserAuthentication } from "src/auth/domain/authentication/authentication";

describe('인증 도메인(authentication)', () => {
    const authenticationMock = new UserAuthentication(
        'accessTokenMock','refreshTokenMock', new Date('March 19, 1998 03:19:00')
    );

    describe('isNeededUpdate()', () => {
        it('마지막 갱신일이 1주일이 지나면 True 반환', () => {
            expect(authenticationMock.isNeededUpdate(new Date('March 29, 1998 03:19:00'))).toBe(true)
        });

        it('마지막 갱신일이 1주일이 지나지 않았으면 False 반환', () => {
            expect(authenticationMock.isNeededUpdate(new Date('March 21, 1998 03:19:00'))).toBe(false)
        });
    });
})