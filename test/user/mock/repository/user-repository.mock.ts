import { User } from "src/user/domain/user";

export const UserRepositoryMock = () => ({
    save: jest.fn((user):User => user),
    findByEmail: jest.fn(),
    delete: jest.fn(),
});