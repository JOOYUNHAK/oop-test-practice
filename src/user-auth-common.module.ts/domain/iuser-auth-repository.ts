import { User } from "./user/user"

export interface IUserAuthCommonRepository {
    findByEmail(email: string): Promise<User>
    findById(id: number): Promise<User>
}