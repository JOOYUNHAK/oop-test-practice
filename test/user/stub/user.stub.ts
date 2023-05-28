import { UserAuthentication } from "src/auth/domain/authentication/authentication";
import { USER_STATUS } from "src/user/domain/enum/user-status.enum";
import { LoginBlockInfo } from "src/user/domain/login-block-info";
import { User } from "src/user/domain/user";
import { Password } from "src/user/domain/user-password";

export const UserStub = () => new User(
    1, 'wndbsgkr@naver.com',
    new Password('$2b$05$.7V10cYWyRXt/vtGqUP9e.8l3xbddczpM5cbwvnv7kVEDTmNJ1Edm', null),
    new UserAuthentication('accessToken', 'refreshToken', new Date()),
    new Date(),
    new LoginBlockInfo(0, null),
    null
);

export const LoginUserStub = () => new User(
    1, 'wndbsgkr@naver.com',
    new Password('$2b$05$.7V10cYWyRXt/vtGqUP9e.8l3xbddczpM5cbwvnv7kVEDTmNJ1Edm', null),
    new UserAuthentication('accessToken', 'refreshToken', new Date()),
    new Date(),
    new LoginBlockInfo(0, null),
    USER_STATUS.LOGINED
);

export const LoginBlockedUserStub = () => new User(
    1, 'wndbsgkr@naver.com',
    new Password('$2b$05$.7V10cYWyRXt/vtGqUP9e.8l3xbddczpM5cbwvnv7kVEDTmNJ1Edm', null),
    new UserAuthentication('accessToken', 'refreshToken', new Date()),
    new Date(),
    new LoginBlockInfo(5, new Date('March 19, 1998 03:19:00')),
    USER_STATUS.BLOCKED
);