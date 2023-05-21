import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOption } from './config/config-module.option';
import { UserModule } from './user/user.module';
import { MysqlModule} from './user/infra/database/mysql/mysql.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/exception/all-exception.filter';
import { AllResponseTransformInterceptor } from './common/response/all-response-transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOption),
    MysqlModule,
    UserModule 
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AllResponseTransformInterceptor
    },
  ],
})
export class AppModule {}
