import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Authentication } from "src/auth/domain/authentication/entity/auth.entity";
import { UserEntity } from "src/user/domain/entity/user.entity";
import { IUserRepository } from "src/user/domain/repository/iuser.repository";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UserRepository extends Repository<UserEntity> implements IUserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly dataSource: DataSource
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

    async findById(id: number): Promise<UserEntity> {
        return await this.userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.authentication', 'auth', 'user.id = auth.id')
            .where('user.id = :id', { id })
            .getOne(); 
    }

    async deleteAuthentication(id: number): Promise<void> {
        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from(Authentication)
            .where("id = :id", { id })
            .execute()
    }
}