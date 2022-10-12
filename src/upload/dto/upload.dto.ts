import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  fileName: string;
}
