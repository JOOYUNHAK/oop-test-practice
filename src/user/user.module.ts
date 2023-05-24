import { Module } from "@nestjs/common";
import { UserMapper } from "./application/mapper/user.mapper";
import { UserService } from "./application/service/user.service";
import { UserController } from "./interface/controller/user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "./infra/database/repository/user.repository";
import { AuthModule } from "src/auth/auth.module";
import { User } from "./domain/user";
import { Password } from "./domain/user-password";
import { LoginBlockInfo } from "./domain/login-block-info";
import { UserAuthentication } from "src/auth/domain/authentication/authentication";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserAuthentication, Password, LoginBlockInfo]),
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