import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsString } from 'class-validator';

export class ConfirmPhoneDto {
  @ApiProperty()
  @IsMobilePhone()
  phone: string;

  @ApiProperty()
  @IsString()
  phoneCodeHash: string;

  @ApiProperty()
  @IsString()
  telegramCode: string;
}
