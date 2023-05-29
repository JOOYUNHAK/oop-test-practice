import { Body, Controller, Delete, Post, Put, Request, UseGuards } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { UserService } from "src/user/application/service/user.service";
import { JwtGuard } from "src/auth/interface/guard/jwt.guard";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { UserDto } from "../../../user-auth-common.module.ts/interface/dto/user.dto";
import { LeaveRequestDto } from "../dto/leave-request.dto";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}
    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<UserDto> {
        return await this.userService.register(registerDto);
    }

    @UseGuards(JwtGuard)
    @Put('password')
    async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto):
        Promise<UserDto> {
        return await this.userService.changePassword(req.user.id, changePasswordDto);
    }

    @UseGuards(JwtGuard)
    @Delete()
    async leave(@Request() req: any, @Body() leaveRequestDto: LeaveRequestDto): Promise<void> {
        return await this.userService.leave(req.user.id, leaveRequestDto);
    }
}