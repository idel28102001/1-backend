import { Global, Module } from '@nestjs/common';
import { TelegramModule } from '../telegram/telegram.module';
import { UploadController } from './controllers/upload.controller';
import { UploadService } from './services/upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './entities/upload.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Upload]), TelegramModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
