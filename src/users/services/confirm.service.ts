import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { RedisService } from '../../redis/redis.service';
import { config } from '../../common/config';
import { UsersService } from './users.service';
import { generateHash, getFrontendUrl } from '../../common/utils';
import { PATHS_AND_PREFIXES } from '../../common/constants';
import { EnumEmailMessageType } from '../types/users.types';

@Injectable()
export class ConfirmService {
  constructor(
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}
  getRedisCode(hash: string, type: EnumEmailMessageType) {
    return `${PATHS_AND_PREFIXES[type].redisPrefix}:${hash}`;
  }

  emailServiceTS(url: string, type: EnumEmailMessageType) {
    switch (type) {
      case 0: {
        return {
          title: `Подтверждение email`,
          message: `Чтобы подтвердить свою электронную почту, перейдите по <a href="${url}" target="_blank">ссылке</a>.`,
        };
      }
      case 1: {
        return {
          title: `Подтверждение пароля`,
          message: `Чтобы подтвердить свой пароль, перейдите по <a href="${url}" target="_blank">ссылке</a>.`,
        };
      }
    }
  }

  async setHash<T>(obj: T, type: EnumEmailMessageType): Promise<string> {
    const hash = generateHash();
    await this.redisService.set(
      this.getRedisCode(hash, type),
      obj,
      config.get('CONFIRM_CODE_EXPIRES'),
    );
    return hash;
  }

  async sendLetter(hash: string, email: string, type: EnumEmailMessageType) {
    const url = getFrontendUrl({
      pathname: PATHS_AND_PREFIXES[type].path,
      params: { hash },
    });
    const text = this.emailServiceTS(url, type);
    return this.emailService.send({
      email,
      title: text.title,
      message: text.message,
    });
  }

  public async confirmPassword(hash: string, password: string) {
    const key = this.getRedisCode(hash, EnumEmailMessageType.RESET_PASSWORD);
    const res: { email: string } | null = await this.redisService.get(key);
    if (!res) {
      throw new ForbiddenException('Срок жизни hash истек');
    }
    await this.usersService.savePassword(res.email, password);
    await this.redisService.del(key);
    return true;
  }

  public async confirmEmail(code: string): Promise<boolean> {
    const key = this.getRedisCode(code, EnumEmailMessageType.EMAIL);
    const res: { email: string; phone: string } | null =
      await this.redisService.get(key);
    if (!res) {
      throw new ForbiddenException('Срок жизни hash истек');
    }
    await this.usersService.saveEmail(res.phone, res.email);
    await this.redisService.del(key);

    await this.sendEmailRegistrationCongrats(res.email);

    return true;
  }

  private async sendEmailRegistrationCongrats(email: string) {
    const title = 'Ваш email подтвержден.';
    const message = `Ваша почта была успешно подтверждена.`;
    return this.emailService.send({ email, title, message });
  }
}
