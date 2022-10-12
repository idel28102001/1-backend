import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from '../services/upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { config } from '../../common/config';
import { UploadDto } from '../dto/upload.dto';
import { Upload } from '../entities/upload.entity';
import { ApiResponseDecorator } from '../../common/decorators/api.response.decorator';
import { Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @ApiResponseDecorator([
    { code: HttpStatus.CREATED, options: { type: Upload } },
    HttpStatus.BAD_REQUEST,
    HttpStatus.PAYLOAD_TOO_LARGE,
  ])
  @UseInterceptors(FileInterceptor('file', config.getUploadOptions()))
  @Post()
  async addFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDto,
  ) {
    if (file) {
      return this.service.addFile(file, dto);
    }
    throw new BadRequestException('Нет файла');
  }

  @ApiResponseDecorator([HttpStatus.OK, HttpStatus.BAD_REQUEST])
  @Delete(':id')
  async removeFile(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.deleteItem(id);
  }

  @Get(':file')
  async getFile(@Param('file') file: string, @Res() res: Response) {
    const buffer = await this.service.loadFile(file);
    const fileStream = new StreamableFile(buffer);
    fileStream.getStream().pipe(res);
  }
}
