import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot } from '../entities/bot.entity';
import { CreateBotDto } from '../dto/create.bot.dto';
import { UsersService } from '../../users/services/users.service';
import { TelegramBotService } from '../../telegram/services/telegram.bot.service';
import { UpdateBotDto } from '../dto/update.bot.dto';
import { UploadService } from '../../upload/services/upload.service';
import { Upload, UploadStatus } from '../../upload/entities/upload.entity';

@Injectable()
export class BotsService {
  constructor(
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
    private readonly telegramService: TelegramBotService,
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  async create(phone: string, dto: CreateBotDto) {
    const user = await this.usersService.getTelegramSession(phone);
    const botData = await this.telegramService.createBot(user, dto);
    const bot = this.botRepository.create({ ...dto, user, ...botData });
    await this.botRepository.save(bot);
    await this.telegramService.updateBot(user, bot, dto);
    return this.findOne(bot.id);
  }

  async update(phone: string, dto: UpdateBotDto) {
    const user = await this.usersService.getTelegramSession(phone);
    const bot = await this.findOne(dto.id);
    if (bot.user.id !== user.id) {
      throw new BadRequestException('Данный бот вам не принадлежит');
    }
    Object.assign(bot, dto);
    if (dto.userPic) {
      const pic: Upload | null = await this.uploadService.findOne(dto.userPic);

      if (!pic) {
        throw new BadRequestException('Картинка не найдена');
      }
      bot.userPic = pic;
      bot.userPic.status = UploadStatus.LINKED;
    }
    await this.botRepository.save(bot);
    await this.telegramService.updateBot(user, bot, dto);
    return bot;
  }

  async findOne(id: string): Promise<Bot> {
    return this.botRepository.findOne({
      where: { id },
      relations: ['userPic'],
    });
  }

  async getBotToken(id: string) {
    const bot: Bot | null = await this.findOne(id);
    if (!bot) {
      throw new NotFoundException(`Бот ${id} не найден`);
    }
    return bot.token;
  }
}
