import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bot } from './entities/bot.entity';
import { BotsController } from './controllers/bots.controller';
import { BotsService } from './services/bots.service';
import { UsersModule } from '../users/users.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bot]),
    forwardRef(() => TelegramModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [BotsController],
  providers: [BotsService],
})
export class BotsModule {}
