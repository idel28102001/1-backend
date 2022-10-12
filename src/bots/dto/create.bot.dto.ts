import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBotDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[\w]+$/g, { message: 'Недопустимые символы' })
  @MinLength(2)
  @MaxLength(28)
  username: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;
}
