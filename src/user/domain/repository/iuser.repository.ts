import { User } from "../user";

export interface IUserRepository {
    findByEmail(email: string): Promise<User>
    findById(id: number): Promise<User>
}