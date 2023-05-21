import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/domain/entity/user.entity";
import { IUserRepository } from "src/user/domain/repository/iuser.repository";
import { Repository } from "typeorm";

@Injectable()
export class UserRepository extends Repository<UserEntity> implements IUserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {
        super(UserEntity, userRepository.manager)
    }

    async findByEmail(email: string): Promise<UserEntity> {
        return await this.userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.authentication', 'auth', 'user.id = auth.id')
            .where('email = :email', { email })
            .getOne();
    }
}