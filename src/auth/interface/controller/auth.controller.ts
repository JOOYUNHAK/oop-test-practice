import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../guard/jwt.guard";
import { LoginDto } from "../dto/login.dto";
import { UserDto } from "src/user-auth-common.module.ts/interface/dto/user.dto";
import { AuthService } from "src/auth/application/service/auth.service";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<UserDto> {
        return await this.authService.login(loginDto);
    }

    @UseGuards(JwtGuard)
    @Post('logout')
    async logout(@Request() req: any): Promise<void> {
        return await this.authService.logout(req.user.id);
    }
}