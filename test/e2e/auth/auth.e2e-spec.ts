import { INestApplication } from "@nestjs/common"
import * as request from 'supertest';
import { HttpAdapterHost } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthModule } from "src/auth/auth.module";
import { AllExceptionsFilter } from "src/common/exception/all-exception.filter";
import { AllResponseTransformInterceptor } from "src/common/response/all-response-transform.interceptor";
import { User } from "src/user-auth-common.module.ts/domain/user/user";
import { Password } from "src/user-auth-common.module.ts/domain/user/user-password";
import { UserAuthentication } from "src/user-auth-common.module.ts/domain/auth/authentication";
import { USER_STATUS } from "src/user/domain/enum/user-status.enum";
import { LoginBlockInfo } from "src/user-auth-common.module.ts/domain/user/login-block-info";
import { JwtModule } from "@nestjs/jwt";
import { jwtModuleOption } from "src/config/jwt-module.option";
import { ConfigModule } from "@nestjs/config";
import { configModuleOption } from "src/config/config-module.option";
import { MysqlModule } from "src/database/mysql/mysql.module";
import { DataSource } from "typeorm";
import { createDataSource } from "../mysql/test-mysql.option";
import { ErrorMessage } from "src/common/exception/enum/error-message.enum";
import { UserDto } from "src/user-auth-common.module.ts/interface/dto/user.dto";

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AuthModule,
                MysqlModule,
                JwtModule.register(jwtModuleOption),
                ConfigModule.forRoot(configModuleOption),
            ]
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalInterceptors(new AllResponseTransformInterceptor());
        app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
        dataSource = await createDataSource(User, Password, UserAuthentication, LoginBlockInfo);
        await app.init();
    });

    afterAll(async () => {
        await dataSource.destroy();
        await app.close();
    });

    describe('/login (POST)', () => {        
        beforeAll(async () => {
            const user = new User(
                null,
                'wndbsgkr@naver.com',
                await Password.create('Testing123456'),
                new UserAuthentication('accessToken', 'refreshToken', new Date()),
                new Date(),
                new LoginBlockInfo(0, null),
                USER_STATUS.LOGINED
            );
            await dataSource.getRepository(User).save(user)
        });
        afterAll(async () => await dataSource.synchronize(true));

        it('로그인에 실패할 경우 404에러', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: 'wndbsgkr@naver.com',
                    password: 'Testing123'
                })
            expect(res.status).toBe(404);
            expect(res.body.message).toBe(ErrorMessage.LOGIN_FAILED)
        });

        it('로그인에 성공할 경우 id와 토큰 반환', async () => {
            const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'wndbsgkr@naver.com',
                password: 'Testing123456'
            })
            expect(res.body.data.id).not.toBeNull();
            expect(res.body.data.accessToken).not.toBeNull();
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data).toHaveProperty('accessToken');
        })
    })
})