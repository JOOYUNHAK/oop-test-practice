import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Authentication } from "src/auth/domain/authentication/entity/auth.entity";
import { UserEntity } from "src/user/domain/entity/user.entity";

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
                entities: [UserEntity, Authentication],
                synchronize: true, // 개발용
                logging: true,
            }),
            inject: [ConfigService]
        })
    ]
})

export class MysqlModule {}