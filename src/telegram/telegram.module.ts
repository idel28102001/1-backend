import { forwardRef, Module } from '@nestjs/common';
import { TelegramService } from './services/telegram.service';
import { TelegramBotService } from './services/telegram.bot.service';
import { TelegramAuthService } from './services/telegram.auth.service';
import { TelegramFileStoreService } from './services/telegram.file.store.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [
    TelegramService,
    TelegramBotService,
    TelegramAuthService,
    TelegramFileStoreService,
  ],
  exports: [TelegramBotService, TelegramAuthService, TelegramFileStoreService],
})
export class TelegramModule {}
