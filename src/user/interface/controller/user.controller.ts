import { Body, Controller, Post, Put, Request, UseGuards } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { UserService } from "src/user/application/service/user.service";
import { LoginDto } from "../dto/login.dto";
import { JwtGuard } from "src/auth/interface/guard/jwt.guard";
import { ChangePasswordDto } from "../dto/change-password.dto";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return await this.userService.register(registerDto);
    }
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return await this.userService.login(loginDto);
    }

    @UseGuards(JwtGuard)
    @Post('logout')
    async logout(@Request() req: any) {
        return await this.userService.logout(req.user.id);
    }

    @UseGuards(JwtGuard)
    @Put('password')
    async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
        return await this.userService.changePassword(req.user.id, changePasswordDto);
    }
}