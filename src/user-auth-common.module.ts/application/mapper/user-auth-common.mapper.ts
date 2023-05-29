import { Injectable } from "@nestjs/common";
import { User } from "src/user-auth-common.module.ts/domain/user/user";
import { UserDto } from "src/user-auth-common.module.ts/interface/dto/user.dto";

@Injectable()
export class UserAuthCommonMapper {
    toDto(user: User): UserDto {
        return {
            id: user.getId(),
            accessToken: user.getClientAuthentication()
        }
    }
}