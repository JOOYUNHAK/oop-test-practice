import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAuthentication } from "src/user-auth-common.module.ts/domain/auth/authentication";
import { LoginBlockInfo } from "src/user-auth-common.module.ts/domain/user/login-block-info";
import { User } from "src/user-auth-common.module.ts/domain/user/user";
import { Password } from "src/user-auth-common.module.ts/domain/user/user-password";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('MYSQL.HOST'),
                port: configService.get('MYSQL.PORT'),
                username: configService.get('MYSQL.USERNAME'), 
                password: configService.get('MYSQL.PASSWORD'),
                database: configService.get('MYSQL.DATABASE'),
                entities: [User, UserAuthentication, Password, LoginBlockInfo],
                synchronize: true, // 개발용
                logging: true,
            }),
            inject: [ConfigService]
        })
    ]
})

export class MysqlModule {}