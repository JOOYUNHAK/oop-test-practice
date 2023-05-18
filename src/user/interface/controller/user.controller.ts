import { Body, Controller, Post } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { UserService } from "src/user/application/service/user.service";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return await this.userService.register(registerDto);
    }
}