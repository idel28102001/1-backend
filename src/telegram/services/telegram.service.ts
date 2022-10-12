import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { StringSession } from 'telegram/sessions';
import { TelegramClient } from 'telegram';
import { config } from '../../common/config';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class TelegramService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  private clients: Record<string, TelegramClient> = {};

  async getTelegramClient(phone: string, telegramSession?: string) {
    if (phone in this.clients) {
      return this.clients[phone];
    }

    const session = telegramSession || '';
    const telegramConfig = config.getTelegramConfig();
    const stringSession = new StringSession(session);
    const client = new TelegramClient(
      stringSession,
      telegramConfig.apiId,
      telegramConfig.apiHash,
      {
        connectionRetries: 5,
      },
    );

    this.clients[phone] = client;
    await client.connect();

    return client;
  }

  async getFileStoreClient() {
    const FSBConfig = config.getFileStoreBotConfig();
    const adminUser = await this.userService.getTelegramSession(
      FSBConfig.adminPhone,
    );
    if (!adminUser) {
      throw new BadRequestException(
        'Невозможно загрузить файл, обратитесь в тех поддержку',
      );
    }
    const client = await this.getTelegramClient(
      FSBConfig.adminPhone,
      adminUser.telegramSession,
    );
    if (!(await client.checkAuthorization())) {
      throw new BadRequestException(
        'Невозможно загрузить файл, обратитесь в тех поддержку',
      );
    }
    return client;
  }
}
