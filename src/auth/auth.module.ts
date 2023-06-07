import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { jwtModuleOption } from "src/config/jwt-module.option";
import { JwtStrategy } from "./interface/guard/strategy/jwt.strategy";
import { PassportModule } from '@nestjs/passport'
import { AuthService } from "./application/service/auth.service";
import { UserAuthCommonModule } from "src/user-auth-common.module.ts/user-auth-common.module";
import { AuthController } from "./interface/controller/auth.controller";
import { LocalStrategy } from "./interface/guard/strategy/local.strategy";

@Module({
    imports: [
        JwtModule.register(jwtModuleOption),
        UserAuthCommonModule,
        PassportModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, LocalStrategy],
    exports: [AuthService]
})
export class AuthModule {}