import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SendCodeDto } from '../dto/send-code.dto';
import { UsersService } from '../services/users.service';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from '../dto/register.user.dto';
import { ResetPasswordDto } from '../dto/reset.password.dto';
import { UpdatePasswordDto } from '../dto/update.password.dto';
import { CheckExistingPhoneDto } from '../dto/check.existing.phone.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EmailUniquePipe } from '../pipes/email.unique.pipe';
import { PhoneUniquePipe } from '../pipes/phone.unique.pipe';
import { ValidateService } from '../services/validate.service';
import { ConfirmService } from '../services/confirm.service';
import { ConfirmEmailDto } from '../dto/confirm.email.dto';
import { UpdateProfileDto } from '../dto/update.profile.dto';
import { JwtRequest } from '../../auth/interfaces/jwt.request.interface';
import { TelegramAuthService } from '../../telegram/services/telegram.auth.service';

@ApiTags('User')
@Controller('user')
export class UsersController {
  constructor(
    private readonly telegramService: TelegramAuthService,
    private readonly usersService: UsersService,
    private readonly validateService: ValidateService,
    private readonly confirmService: ConfirmService,
  ) {}

  @HttpCode(200)
  @Post('check-existing-phone')
  async checkExistingPhone(@Body() dto: CheckExistingPhoneDto) {
    await this.validateService.checkExistingPhone(dto.phone);
  }

  @Post('send-code')
  async sendCode(@Body() data: SendCodeDto) {
    return await this.telegramService.sendCode(data.phone);
  }

  @ApiCreatedResponse({ type: User })
  @Post('register')
  register(@Body(EmailUniquePipe, PhoneUniquePipe) data: RegisterUserDto) {
    return this.usersService.register(data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('confirm-email')
  async confirmEmail(@Body() dto: ConfirmEmailDto) {
    return await this.confirmService.confirmEmail(dto.hash);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.usersService.resetPassword(resetPasswordDto);
    return true;
  }

  @HttpCode(HttpStatus.OK)
  @Post('update-password')
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    await this.usersService.updatePassword(updatePasswordDto);
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: JwtRequest) {
    return this.usersService.getByPhone(req.user.phone);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UsePipes(new ValidationPipe({ transform: true }))
  async changeProfile(
    @Body() updateUserProfile: UpdateProfileDto,
    @Req() req: JwtRequest,
  ) {
    await this.usersService.update(updateUserProfile, req.user.userId);
  }
}
