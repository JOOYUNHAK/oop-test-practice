import { AuthService } from "src/auth/application/service/auth.service";
import { UserAuthenticationStub } from "../stub/authentication.stub";

export const AuthServiceMock = {
    createAuthentication: jest.fn(() => UserAuthenticationStub())
};

export const AuthServiceMockProvider = {
    provide: AuthService,
    useValue: AuthServiceMock
};