import { UserStub } from "test/user/stub/user.stub";

export const UserRepositoryMock =  {
    save: jest.fn(() => UserStub()),
    findByEmail: jest.fn()
}