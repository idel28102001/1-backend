import { Injectable, NotFoundException } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CustomFile } from 'telegram/client/uploads';
import { config } from '../../common/config';
import { Upload } from '../../upload/entities/upload.entity';
import { TelegramClient } from 'telegram';
import { Api } from 'telegram/tl';

@Injectable()
export class TelegramFileStoreService {
  constructor(private readonly service: TelegramService) {}

  async saveFile(file: Express.Multer.File, filename?: string) {
    const client = await this.service.getFileStoreClient();
    const { botUsername } = config.getFileStoreBotConfig();
    const toUpload = new CustomFile(
      filename || file.originalname,
      file.size,
      file.path,
    );
    try {
      const uploadedFile = await client.uploadFile({
        file: toUpload,
        workers: 1,
      });
      const { id } = await client.sendFile('@' + botUsername, {
        file: uploadedFile,
      });
      return id;
    } catch (e) {
      throw e;
    }
  }

  async getDialogs() {
    const client = await this.service.getFileStoreClient();
    const channels = (await client.getDialogs({})).filter(
      (dialog) => dialog.entity.className === 'Channel',
    );
    // const dialog = await client.getEntity(dialogs[0].entity.id);
    console.log(channels);
  }

  async getFile(messageId: number): Promise<Buffer> {
    const client = await this.service.getFileStoreClient();
    const { botUsername } = config.getFileStoreBotConfig();
    const message = await client.getMessages('@' + botUsername, {
      ids: [messageId],
    });
    if (message.length) {
      return client.downloadMedia(message[0], { workers: 1 });
    } else {
      throw new NotFoundException('Сообщение с файлом не найдено');
    }
  }

  async getFileForTelegramClient(
    upload: Upload,
    client: TelegramClient,
  ): Promise<Api.InputFile | Api.InputFileBig> {
    const toUpload = new CustomFile(
      upload.originalName,
      upload.filesize,
      upload.url,
      await this.getFile(upload.telegramMessageIdWithFile),
    );
    try {
      return client.uploadFile({
        file: toUpload,
        workers: 1,
      });
    } catch (e) {
      throw e;
    }
  }
}
