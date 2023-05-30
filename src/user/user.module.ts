import { Module } from "@nestjs/common";
import { UserMapper } from "./application/mapper/user.mapper";
import { UserService } from "./application/service/user.service";
import { UserController } from "./interface/controller/user.controller";
import { AuthModule } from "src/auth/auth.module";
import { UserAuthCommonModule } from "src/user-auth-common.module.ts/user-auth-common.module";

@Module({
    imports: [
        UserAuthCommonModule,
        AuthModule
    ],
    controllers: [UserController],
    providers: [
        UserMapper,
        UserService,
    ]
}) 
export class UserModule {};