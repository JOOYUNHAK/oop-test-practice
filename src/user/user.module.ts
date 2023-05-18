import { Module } from "@nestjs/common";
import { UserMapper } from "./application/mapper/user.mapper";
import { UserService } from "./application/service/user.service";
import { UserController } from "./interface/controller/user.controller";

@Module({
    controllers: [UserController],
    providers: [
        UserMapper,
        UserService,
    ]
}) 
export class UserModule {};