import { Module } from "@nestjs/common";
import { UserMapper } from "./application/mapper/user.mapper";
import { UserService } from "./application/service/user.service";
import { UserController } from "./interface/controller/user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./domain/entity/user.entity";
import { UserRepository } from "./infra/database/repository/user.repository";
import { AuthModule } from "src/auth/auth.module";
import { Authentication } from "src/auth/domain/authentication/entity/auth.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, Authentication]),
        AuthModule
    ],
    controllers: [UserController],
    providers: [
        UserMapper,
        UserService,
        UserRepository
    ]
}) 
export class UserModule {};