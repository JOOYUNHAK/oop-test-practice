import { ForbiddenException } from "@nestjs/common";
import { ErrorMessage } from "src/common/exception/enum/error-message.enum";
import { LoginBlockInfo } from "src/user-auth-common.module.ts/domain/user/login-block-info"

describe('로그인 시도 정보(LoginBLockInfo)', () => {
    let blockInfo: LoginBlockInfo;

    describe('check()', () => {
        it('로그인 차단 당한지 5분이 지났으면 검사 통과', () => {
            blockInfo = new LoginBlockInfo(5, new Date('March 19, 2022 04:10:00'));
            const result = blockInfo.check(new Date('March 19, 2022 04:15:01'));
            expect(result).toBe(undefined);
        });
        it('로그인 차단 당한지 5분이 지나지 않았으면 오류 반환', () => {
            blockInfo = new LoginBlockInfo(5, new Date('March 19, 2022 04:10:00'));
            const result = () => blockInfo.check(new Date('March 19, 2022 04:12:00'));
            expect(result).toThrowError(new ForbiddenException(ErrorMessage.LOGIN_COUNT_EXCEED));
        });
    });

    describe('initBlockInfo()', () => {
        it('로그인 시도 횟수가 초기화 되어야 한다', () => {
            blockInfo = new LoginBlockInfo(4, null);
            blockInfo.initBlockInfo();
            expect(blockInfo.getTryCount()).toBe(0);
        });
    });

    describe('handleFailed()', () => {
        it('실패 횟수를 1번 증가시키고 횟수가 5번 미만이면 차단이 되지 않는다', () => {
            blockInfo = new LoginBlockInfo(3, null);
            const blockedTime = new Date('March 19, 2022 03:30:00');
            blockInfo.handleFailed(blockedTime);
            expect(blockInfo.getTryCount()).toBe(4);
            expect(blockInfo.getBlockedTime()).toBe(null);
        });

        it('실패 횟수를 1번 증가시키고 횟수가 5번이면 차단이 된다', () => {
            blockInfo = new LoginBlockInfo(4, null);
            const blockedTime = new Date('March 19, 2022 03:30:00');
            blockInfo.handleFailed(blockedTime);
            expect(blockInfo.getTryCount()).toBe(5);
            expect(blockInfo.getBlockedTime()).toBe(blockedTime);
        })
    })

    describe('addFailedCount()', () => {
        it('로그인 시도 횟수가 5번보다 작으면 1번 증가해야 한다', () => {
            blockInfo = new LoginBlockInfo(4, null);
            blockInfo.addFailedCount();
            expect(blockInfo.getTryCount()).toBe(5);
        });

        it('로그인 시도 횟수가 5번이면 증가하지 않아야 한다', () => {
            blockInfo = new LoginBlockInfo(5, null);
            blockInfo.addFailedCount();
            expect(blockInfo.getTryCount()).toBe(5);
        });
    });

    describe('toBeBlocked()', () => {
        it('로그인 시도 횟수가 5번이면 True 반환', () => {
            blockInfo = new LoginBlockInfo(5, new Date());
            expect(blockInfo.toBeBlocked()).toBe(true);
        });

        it('로그인 시도 횟수가 5번 미만이면 False 반환', () => {
            blockInfo = new LoginBlockInfo(4, new Date());
            expect(blockInfo.toBeBlocked()).toBe(false);
        })
    })
})