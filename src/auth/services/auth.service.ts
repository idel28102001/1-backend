import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { VerifyService } from './verify.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { Request } from 'express';
import { AuthUser } from '../../users/interfaces/auth.user.interface';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly verifyingService: VerifyService,
  ) {}

  async updateRefresh(data: RefreshDto, req: Request) {
    const refreshPayload = this.tokenService.decodeRefresh(data.refreshToken);
    const hasAccess = await this.verifyingService.verifyRefresh(
      refreshPayload,
      data.refreshToken,
    );
    const user: AuthUser = await this.usersService.getForAuthByPhone(
      refreshPayload.phone,
    );

    if (!hasAccess || !user) {
      throw new UnauthorizedException();
    }

    return await this.tokenService.generateJwt(user, req);
  }

  async login(loginDto: LoginDto, req: Request) {
    const user: AuthUser = await this.usersService.getForAuthByPhone(
      loginDto.phone,
    );
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException();
    }

    return await this.tokenService.generateJwt(user, req);
  }

  async logout(id: string, req: Request): Promise<void> {
    await this.tokenService.deleteByUserId(id, req);
  }
}
