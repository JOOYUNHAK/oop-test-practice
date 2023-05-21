import { Injectable } from "@nestjs/common";
import { AuthService } from "src/auth/application/service/auth.service";
import { UserAuthentication } from "src/auth/domain/authentication/authentication";
import { Authentication } from "src/auth/domain/authentication/entity/auth.entity";
import { JwtToken } from "src/auth/infra/authentication/token/jwt-token";
import { UserEntity } from "src/user/domain/entity/user.entity";
import { User } from "src/user/domain/user";
import { Email } from "src/user/domain/user-email";
import { Password } from "src/user/domain/user-password";
import { RegisterDto } from "src/user/interface/dto/register.dto";
import { UserDto } from "src/user/interface/dto/user.dto";

@Injectable()
export class UserMapper {
    constructor(
        private readonly authService: AuthService
    ) {}
    /* Dto를 도메인 객체로 변환 */
    async dtoToDomain(registerDto: RegisterDto): Promise<User> {
        const email = Email.create(registerDto.email); 
        /* 비밀번호 유효성 검사와 인증을 얻어 새로운 사용자로 변환 */
        const [encryptedPassword, authentication] = await Promise.all([
            Password.create(registerDto.password, false),
            this.authService.createAuthentication(registerDto.email)
        ]);
        return new User(
            null,
            email,
            encryptedPassword,
            authentication,
            new Date(),
            new Date(),
            0,
            null,
            null,
        );
    }

    /* 도메인 모델을 Entity로 */
    domainToEntity(user: User): UserEntity {
        return new UserEntity(
            user.getId(),
            user.getEmail().getValue(),
            user.getPassword().getValue(),
            user.getUpdateTime(), 
            user.getRegisteredTime(),
            user.getLoginTryCount(),
            user.getBlockedTime(),
            user.getStatus(),
            this.authDomainToEntity(user.getAuthentication())
        )
    }

    /* Entity를 도메인 모델로 */
    async entityToDomain(userEntity: UserEntity): Promise<User> {
        return new User(
            userEntity.getId(),
            Email.create(userEntity.getEmail()),
            await Password.create(userEntity.getPassword(), true),
            this.authEntityToDomain(userEntity.getId(), userEntity.getAuthentication()),
            userEntity.getUpdatedTime(),
            userEntity.getRegisteredTime(),
            userEntity.getLoginTry(),
            userEntity.getBlockedTime(),
            userEntity.getStatus()
        )
    }

    /* 도메인 모델을 사용자에게 전달할 Dto로 */
    toDto(user: User): UserDto {
        return {
            id: user.getId(),
            email: user.getEmail().getValue(),
            accessToken: user.getClientAuthentication()
        }
    }

    /* 새로 생성하여 받은 인증을 Auth 테이블에 저장하기 위해 Entity로 */
    private authDomainToEntity(userAuthentication: UserAuthentication): Authentication {
        return new Authentication(
            userAuthentication.getId(),
            userAuthentication.getType().getRefreshAuthentication(), // 인증 갱신용 -> DB 저장
            userAuthentication.getType().getRefreshedTime() // 마지막으로 갱신된 시간
        )
    } 

    /* UserEntity에 있는 인증을 도메인 모델로 변경 */
    private authEntityToDomain(userId: number, authentication: Authentication): UserAuthentication {
        return new UserAuthentication(
            userId,  
            new JwtToken(null, authentication.getRefreshAuthentication(), authentication.getUpdatedTime())
        )
    }
}