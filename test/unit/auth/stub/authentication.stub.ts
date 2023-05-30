import { UserAuthentication } from "src/user-auth-common.module.ts/domain/auth/authentication";

export const UserAuthenticationStub = () => UserAuthentication.createWith('accessToken', 'refreshToken');