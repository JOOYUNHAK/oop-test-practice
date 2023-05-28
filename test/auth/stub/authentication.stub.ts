import { UserAuthentication } from "src/auth/domain/authentication/authentication";

export const UserAuthenticationStub = () => UserAuthentication.createWith('accessToken', 'refreshToken');