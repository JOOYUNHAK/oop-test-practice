import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configModuleOption } from './config/config-module.option';
import { UserModule } from './user/user.module';
import { MysqlModule} from './user/infra/database/mysql/mysql.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOption),
    MysqlModule,
    AuthModule,
    UserModule 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
