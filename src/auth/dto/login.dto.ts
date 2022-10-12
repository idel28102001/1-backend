import { IsMobilePhone, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsMobilePhone()
  public phone: string;

  @ApiProperty()
  @IsString()
  public password: string;
}
