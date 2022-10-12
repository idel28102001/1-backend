import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { CreateBotDto } from '../../bots/dto/create.bot.dto';
import { deferredRequest } from '../../common/utils';
import {
  AVAILABLE_BOT_EDIT_PROPS,
  BOT_FATHER_USERNAME,
} from '../../common/constants';
import { TotalList } from 'telegram/Helpers';
import { Api } from 'telegram';
import { TelegramService } from './telegram.service';
import { UpdateBotDto } from '../../bots/dto/update.bot.dto';
import { Bot } from '../../bots/entities/bot.entity';
import { TelegramFileStoreService } from './telegram.file.store.service';

@Injectable()
export class TelegramBotService {
  constructor(
    private readonly service: TelegramService,
    private readonly fileStoreService: TelegramFileStoreService,
  ) {}

  async updateBot(
    user: User,
    bot: Bot,
    dto: CreateBotDto | UpdateBotDto,
  ): Promise<boolean> {
    const client = await this.service.getTelegramClient(
      user.phone,
      user.telegramSession,
    );

    if (!(await client.checkAuthorization())) {
      throw new ForbiddenException('Не авторизован в телеграмме');
    }

    for (const propName in dto) {
      if (AVAILABLE_BOT_EDIT_PROPS.includes(propName)) {
        await deferredRequest(
          client.sendMessage(BOT_FATHER_USERNAME, {
            message: `/set${propName.toLowerCase()}`,
          }),
        );
        await deferredRequest(
          client.sendMessage(BOT_FATHER_USERNAME, {
            message: '@' + bot.username,
          }),
        );

        if (propName === 'userPic') {
          await deferredRequest(
            client.sendFile(BOT_FATHER_USERNAME, {
              file: await this.fileStoreService.getFileForTelegramClient(
                bot.userPic,
                client,
              ),
            }),
          );
        } else {
          await deferredRequest(
            client.sendMessage(BOT_FATHER_USERNAME, { message: dto[propName] }),
          );
        }
      }
    }

    return true;
  }

  async createBot(
    user: User,
    dto: CreateBotDto,
  ): Promise<{ token: string; username: string; link: string }> {
    const client = await this.service.getTelegramClient(
      user.phone,
      user.telegramSession,
    );

    if (!(await client.checkAuthorization())) {
      throw new ForbiddenException('Не авторизован в телеграмме');
    }

    await deferredRequest(
      client.sendMessage(BOT_FATHER_USERNAME, { message: '/newbot' }),
    );
    await deferredRequest(
      client.sendMessage(BOT_FATHER_USERNAME, { message: dto.name }),
    );

    const botUserName =
      dto.username +
      (dto.username.slice(-3).toLowerCase() === 'bot' ? '' : '_bot');

    await deferredRequest(
      client.sendMessage(BOT_FATHER_USERNAME, {
        message: botUserName,
      }),
    );

    const fathersAnswer: TotalList<Api.Message> = await deferredRequest<
      TotalList<Api.Message>
    >(
      client.getMessages(BOT_FATHER_USERNAME, {
        limit: 1,
        fromUser: BOT_FATHER_USERNAME,
      }),
    );

    if (!fathersAnswer.length) {
      throw new InternalServerErrorException(
        'При создании бота что-то пошло не так',
      );
    }

    const res = /HTTP\sAPI:\s*(?<token>[^\s]+)/.exec(fathersAnswer[0].message);

    if (!res) {
      throw new BadRequestException(
        `Бот с именем ${dto.username} уже существует.`,
      );
    }

    return {
      token: res.groups.token,
      username: botUserName,
      link: `t.me/${botUserName}`,
    };
  }
}
