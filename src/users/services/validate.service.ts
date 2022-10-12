import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthUser } from '../interfaces/auth.user.interface';

@Injectable()
export class ValidateService {
  constructor(private readonly usersService: UsersService) {}

  async checkExistEmail(email: string) {
    const user = await this.usersService.getByEmail(email);
    if (user) {
      throw new ConflictException(
        'Данный адрес электронной почты уже зарегистрирован в системе',
      );
    }
    return true;
  }

  async checkExistingPhone(phone: string): Promise<boolean> {
    const user: AuthUser = await this.usersService.getForAuthByPhone(phone);
    if (user) {
      throw new ConflictException('Телефон уже зарегистрирован в системе');
    }
    return true;
  }
}
