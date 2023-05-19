import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { configModuleOption } from 'src/user/infra/database/mysql/config/config-module.option';
import { MysqlModule} from './user/infra/database/mysql/mysql.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOption),
    MysqlModule,
    UserModule 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
