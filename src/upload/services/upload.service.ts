import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TelegramFileStoreService } from '../../telegram/services/telegram.file.store.service';
import { UploadDto } from '../dto/upload.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Upload, UploadStatus, UploadType } from '../entities/upload.entity';
import { Repository } from 'typeorm';
import { extname } from 'path';
import { isUUID } from 'class-validator';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
    private readonly telegramService: TelegramFileStoreService,
  ) {}

  changeFileStatus(id: string, status: UploadStatus = UploadStatus.LINKED) {
    return this.createOrUpdateItem({ status }, id);
  }

  async findOne(id: string): Promise<Upload> {
    return this.uploadRepository.findOne({
      where: { id },
    });
  }

  getFileType(file: Express.Multer.File): UploadType {
    const type = file.mimetype.substring(0, file.mimetype.indexOf('/'));
    return UploadType[type.toUpperCase()] || UploadType.DOCUMENT;
  }

  async addFile(file: Express.Multer.File, dto: UploadDto) {
    const ext = extname(file.originalname);
    const filename = dto.fileName ? dto.fileName + ext : file.originalname;
    const telegramMessageIdWithFile = await this.telegramService.saveFile(
      file,
      filename,
    );
    const fileType: UploadType = this.getFileType(file);

    const fields: Partial<Record<keyof Upload, any>> = {
      telegramMessageIdWithFile,
      filesize: file.size,
      type: fileType,
      originalName: dto.fileName ? dto.fileName + ext : file.originalname,
      extension: ext,
    };

    try {
      return await this.createOrUpdateItem(fields, dto.id);
    } catch (e) {
      throw e;
    }
  }

  async createOrUpdateItem(
    fields: Partial<Record<keyof Upload, any>>,
    id?: string,
  ): Promise<Upload> {
    let item: Upload | null = id
      ? await this.uploadRepository.findOne({ where: { id } })
      : null;
    if (id && !item) {
      throw new BadRequestException(`Файла с id ${id} нет в базе`);
    }

    if (!item) {
      item = this.uploadRepository.create(fields);
    } else {
      Object.assign(item, fields);
    }
    await this.uploadRepository.save(item);
    return this.uploadRepository.findOne({ where: { id: item.id } });
  }

  async deleteItem(id: string) {
    const item = await this.uploadRepository.findOne({ where: { id } });
    if (!item) {
      throw new BadRequestException(`Файла с id ${id} нет в базе`);
    }

    await this.uploadRepository.delete(item);
    return true;
  }

  async loadFile(file: string) {
    const ext = extname(file);
    const id = file.substring(0, file.lastIndexOf(ext));
    let upload: Upload | null = null;
    if (isUUID(id)) {
      upload = await this.uploadRepository.findOne({
        where: { extension: ext, id },
      });
    }
    if (!upload) {
      throw new NotFoundException();
    }

    return this.telegramService.getFile(upload.telegramMessageIdWithFile);
  }
}
