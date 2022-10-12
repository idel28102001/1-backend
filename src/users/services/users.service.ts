import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ResetPasswordDto } from '../dto/reset.password.dto';
import { UpdatePasswordDto } from '../dto/update.password.dto';
import { RegisterUserDto } from '../dto/register.user.dto';
import { AuthUser } from '../interfaces/auth.user.interface';
import { ConfirmService } from './confirm.service';
import { UpdateProfileDto } from '../dto/update.profile.dto';
import { EnumEmailMessageType } from '../types/users.types';
import { TelegramAuthService } from '../../telegram/services/telegram.auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => TelegramAuthService))
    private readonly telegramService: TelegramAuthService,
    @Inject(forwardRef(() => ConfirmService))
    private readonly confirmService: ConfirmService,
  ) {}

  async getForAuthByPhone(phone: string): Promise<AuthUser | null> {
    return await this.userRepository.findOne({
      select: ['id', 'password', 'phone', 'phoneCodeHash'],
      where: { phone: phone },
    });
  }

  async getByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { phone: phone, isActive: true },
    });
  }

  async getTelegramSession(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { phone: phone, isActive: true },
      select: ['telegramSession', 'phone', 'id'],
    });
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email, isActive: true, isEmailConfirmed: true },
    });
  }

  async getById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async saveEmail(phone: string, email: string) {
    const user: User | null = await this.getByPhone(phone);
    if (user) {
      user.email = email;
      user.isEmailConfirmed = true;
      await this.userRepository.save(user);
      return true;
    }
    throw new BadRequestException('Пользователь не найден');
  }

  async savePassword(email: string, password: string) {
    const user: User | null = await this.getByEmail(email);
    if (user) {
      user.password = password;
      await this.userRepository.save(user);
    } else {
      throw new BadRequestException('Пользователь не найден');
    }
  }

  async create(dto: Record<string, any>) {
    const messageType = EnumEmailMessageType.EMAIL;
    const user: User = this.userRepository.create(dto);

    if (user.email) {
      const obj = {
        email: user.email,
        phone: user.phone,
      };
      const hash = await this.confirmService.setHash(obj, messageType);
      await this.confirmService.sendLetter(hash, dto.email, messageType);
    }

    await this.userRepository.save(user);
    return this.getByPhone(user.phone);
  }

  async register(dto: RegisterUserDto) {
    const telegramSession = await this.telegramService.confirmPhone(dto);
    return this.create({
      ...dto,
      isActive: true,
      telegramSession: telegramSession,
    });
  }

  async resetPassword(dto: ResetPasswordDto) {
    const messageType = EnumEmailMessageType.RESET_PASSWORD;
    const user = await this.getByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    } else {
      const hash = await this.confirmService.setHash(
        { email: user.email },
        messageType,
      );
      await this.confirmService.sendLetter(hash, dto.email, messageType);
    }
  }
  async updatePassword(dto: UpdatePasswordDto) {
    await this.confirmService.confirmPassword(dto.hash, dto.password);

    //
  }

  async update(dto: UpdateProfileDto, id: string) {
    const messageType = EnumEmailMessageType.EMAIL;
    const user: User | null = await this.getById(id);
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }
    if (dto.email) {
      const obj = {
        email: user.email,
        phone: user.phone,
      };
      const hash = await this.confirmService.setHash(obj, messageType);
      await this.confirmService.sendLetter(hash, dto.email, messageType);
      delete dto.email;
    }
    Object.assign(user, dto);
    await this.userRepository.save(user);
  }
}
