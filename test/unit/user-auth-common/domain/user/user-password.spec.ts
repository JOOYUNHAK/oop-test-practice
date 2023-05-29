import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ErrorMessage } from 'src/common/exception/enum/error-message.enum';
import { Password } from 'src/user-auth-common.module.ts/domain/user/user-password';

/*  
    내부가 비동기 함수 테스트일 경우 jest에게 비동기 함수라고 await으로 알려줘야함
    그렇지 않으면 테스트가 실패했는데도 오류 매세지만 뜨고 테스트는 통과됨
*/
describe('비밀번호 객체(user-password)', () => {
    let passwordMock: Password;
    beforeAll(async () => {
        passwordMock = await Password.create('Aaabb12345');
    });

    describe('validate()', () => {
        const error = new BadRequestException(ErrorMessage.PASSWORD_VALIDATE);

        it('숫자가 포함되어 있지 않으면 유효성 검사에 실패', async () => {
            await expect(Password.create('aaabbbccC')).rejects
            .toThrowError(error);
        });

        it('대문자가 포함되어 있지 않으면 유효성 검사에 실패', async () => {
            await expect(Password.create('aaabbbccc123')).rejects
            .toThrowError(error);
        });

        it('8글자를 넘지 않으면 유효성 검사에 실패',async () => {
            await expect(Password.create('Aaabb1')).rejects
            .toThrowError(error);
        })

        it('대소문자 각각 1자이상으로 10자리 이상이면 유효성 검사 통과', async () => {
            expect(passwordMock).toBeInstanceOf(Password)
        })
    });

    describe('comparePassword()', () => {
        it('사용자 비밀번호와 일치하지 않으면 False 반환', async () => {
            await expect(passwordMock.comparePassword('Aaabb1234')).resolves
            .toBe(false);
        });

        it('사용자 비밀번호와 일치하면 True 반환', async () => {
            await expect(passwordMock.comparePassword('Aaabb12345')).resolves
            .toBe(true);
        })
    });

    describe('changePassword()', () => {
        let changeResult: Promise<boolean>;

        it('변경 전 사용자 비밀번호 확인시 일치하지 않으면 오류 반환', async () => {
            changeResult = passwordMock.changePassword(
                'Aaabb1234', 'Aaabb12345', new Date()
            );
            await expect(changeResult).rejects.toThrowError(
                new UnauthorizedException(ErrorMessage.LOGIN_FAILED)
            )
        });

        it('이전 비밀번호와 일치하면 오류 반환', async () => {
            changeResult = passwordMock.changePassword(
                'Aaabb12345', 'Aaabb12345', new Date()
            );
            await expect(changeResult).rejects.toThrowError(
                new ConflictException(ErrorMessage.DUPLICATED_PASSWORD)
            );
        })

        it('본인이 맞고 이전 비밀번호와 맞아도 유효성 검사가 맞지 않으면 실패', async () => {
            const mockTime = new Date();
            changeResult = passwordMock.changePassword(
                'Aaabb12345', 'Aaabb1212', mockTime
            );
            await expect(changeResult).rejects
            .toThrowError(new BadRequestException(ErrorMessage.PASSWORD_VALIDATE));
        });

        it('본인 확인, 기존 비밀번호 일치 여부, 유효성 검사에 통과하면 정상 변경', async () => {
            const mockTime = new Date();
            changeResult = passwordMock.changePassword(
                'Aaabb12345', 'Test1234567', mockTime
            );
            const compareResult = passwordMock.comparePassword('Test1234567');
            await expect(changeResult).resolves.toBe(true);
        })
    })
})