import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsNotEmpty } from 'class-validator';

export class SendCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMobilePhone()
  phone: string;
}
