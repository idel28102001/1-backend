import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshDto } from '../dto/refresh.dto';
import { Request } from 'express';
import { JwtRequest } from '../interfaces/jwt.request.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  public async login(@Body() data: LoginDto, @Req() req: Request) {
    return await this.authService.login(data, req);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: JwtRequest) {
    await this.authService.logout(req.user.userId, req);
    return true;
  }

  @Post('refresh')
  public async refresh(@Body() data: RefreshDto, @Req() req: Request) {
    return await this.authService.updateRefresh(data, req);
  }
}
