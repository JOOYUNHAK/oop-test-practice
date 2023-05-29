import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "../../domain/user/user";
import { IUserAuthCommonRepository } from "../../domain/iuser-auth-repository";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserAuthCommonRepository extends Repository<User> implements IUserAuthCommonRepository {
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