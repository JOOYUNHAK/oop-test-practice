import { Module } from "@nestjs/common";
import { AuthService } from "./application/service/auth.service";
import { JwtModule } from "@nestjs/jwt";
import { jwtModuleOption } from "src/config/jwt-module.option";

@Module({
    imports: [JwtModule.register(jwtModuleOption)],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule {}