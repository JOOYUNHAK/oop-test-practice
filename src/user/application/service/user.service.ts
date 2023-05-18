import { Injectable } from "@nestjs/common";
import { RegisterDto } from "src/user/interface/dto/register.dto";
import { UserMapper } from "../mapper/user.mapper";
import { User } from "src/user/domain/user";

@Injectable()
export class UserService{
    constructor(
        private readonly userMapper: UserMapper,
    ) {}
    async register(registerDto: RegisterDto) {
        const user: User = await this.userMapper.dtoToDomain(registerDto);
    }
}