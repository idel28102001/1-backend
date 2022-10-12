import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfirmPhoneDto } from '../../users/dto/confirm.phone.dto';
import { Api } from 'telegram';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramAuthService {
  constructor(private readonly service: TelegramService) {}

  async sendCode(phone: string) {
    const client = await this.service.getTelegramClient(phone);

    try {
      const { phoneCodeHash } = await client.sendCode(
        { apiId: client.apiId, apiHash: client.apiHash },
        phone,
      );
      return phoneCodeHash;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  async confirmPhone(dto: ConfirmPhoneDto) {
    try {
      const client = await this.service.getTelegramClient(dto.phone);

      await client.invoke(
        new Api.auth.SignIn({
          phoneNumber: dto.phone,
          phoneCodeHash: dto.phoneCodeHash,
          phoneCode: dto.telegramCode,
        }),
      );

      return client.session.save();
    } catch (e) {
      if (!e.message) {
        throw new BadRequestException(e);
      }

      throw new BadRequestException(e.message);
    }
  }
}
