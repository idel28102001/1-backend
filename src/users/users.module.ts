import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './controllers/users.controller';
import { TelegramModule } from '../telegram/telegram.module';
import { UsersService } from './services/users.service';
import { ConfirmService } from './services/confirm.service';
import { ValidateService } from './services/validate.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => TelegramModule)],
  controllers: [UsersController],
  providers: [UsersService, ConfirmService, ValidateService],
  exports: [UsersService],
})
export class UsersModule {}
