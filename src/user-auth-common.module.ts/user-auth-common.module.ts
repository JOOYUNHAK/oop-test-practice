import { Module } from "@nestjs/common";
import { UserAuthCommonRepository } from "./infra/repository/user-auth-common.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./domain/user/user";
import { Password } from "./domain/user/user-password";
import { LoginBlockInfo } from "./domain/user/login-block-info";
import { UserAuthentication } from "src/user-auth-common.module.ts/domain/auth/authentication";
import { UserAuthCommonMapper } from "./application/mapper/user-auth-common.mapper";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Password, LoginBlockInfo, UserAuthentication])
    ],
    providers: [
        UserAuthCommonRepository,
        UserAuthCommonMapper
    ],
    exports: [
        UserAuthCommonRepository,
        UserAuthCommonMapper
    ]
})

export class UserAuthCommonModule {};