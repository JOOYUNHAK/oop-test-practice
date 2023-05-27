import { UserAuthentication } from "src/auth/domain/authentication/authentication";
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