import { Module } from "@nestjs/common";
import { AuthService } from "./application/service/auth.service";
import { JwtModule } from "@nestjs/jwt";
import { jwtModuleOption } from "src/config/jwt-module.option";
import { JwtStrategy } from "./interface/guard/strategy/jwt.strategy";
import { PassportModule } from '@nestjs/passport'

@Module({
    imports: [
        JwtModule.register(jwtModuleOption),
        PassportModule
    ],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService]
})
export class AuthModule {}