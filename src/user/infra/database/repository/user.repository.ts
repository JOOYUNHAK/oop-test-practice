import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IUserRepository } from "src/user/domain/repository/iuser.repository";
import { User } from "src/user/domain/user";
import { Repository } from "typeorm";

@Injectable()
export class UserRepository extends Repository<User> implements IUserRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super(User, userRepository.manager)
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.authentication', 'auth', 'user.id = auth.user_id')
            .innerJoinAndSelect('user.password', 'password', 'user.id = password.user_id')
            .innerJoinAndSelect('user.loginBlockInfo', 'blockInfo', 'user.id = blockInfo.user_id')
            .where('email = :email', { email })
            .getOne();
    }

    async findById(id: number): Promise<User> {
        return await this.userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.authentication', 'auth', 'user.id = auth.user_id')
            .innerJoinAndSelect('user.password', 'password', 'user.id = password.user_id')
            .innerJoinAndSelect('user.loginBlockInfo', 'blockInfo', 'user.id = blockInfo.user_id')
            .where('user.id = :id', { id })
            .getOne();  
    }
}