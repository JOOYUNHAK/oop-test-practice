import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../guard/jwt.guard";
import { LoginDto } from "../dto/login.dto";
import { UserDto } from "src/user-auth-common.module.ts/interface/dto/user.dto";
import { AuthService } from "src/auth/application/service/auth.service";
import { LocalGuard } from "../guard/local.guard";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @UseGuards(LocalGuard)
    @Post('login')
    async login(@Request() req: any): Promise<UserDto> {
        return req.user;
    }

    @UseGuards(JwtGuard)
    @Post('logout')
    async logout(@Request() req: any): Promise<void> {
        return await this.authService.logout(req.user.id);
    }
}