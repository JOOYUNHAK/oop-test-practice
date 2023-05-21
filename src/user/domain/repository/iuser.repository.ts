import { UserEntity } from "../entity/user.entity";

export interface IUserRepository {
    findByEmail(email: string): Promise<UserEntity>
    findById(id: number): Promise<UserEntity>
}