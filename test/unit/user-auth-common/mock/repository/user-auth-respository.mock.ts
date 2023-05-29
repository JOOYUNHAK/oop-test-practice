import { UserAuthCommonRepository } from "src/user-auth-common.module.ts/infra/repository/user-auth-common.repository";

export const UserAuthCommonRepoMock = () => ({
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn()
})

export const UserAuthCommonRepoMockProvider = {
    provide: UserAuthCommonRepository,
    useValue: UserAuthCommonRepoMock()
};