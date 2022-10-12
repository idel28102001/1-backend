import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './common/config';
import { UsersModule } from './users/users.module';
import { TelegramModule } from './telegram/telegram.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { BotsModule } from './bots/bots.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => config.getDatabaseOptions(),
    }),
    EmailModule,
    AuthModule,
    UsersModule,
    TelegramModule,
    RedisModule,
    BotsModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
