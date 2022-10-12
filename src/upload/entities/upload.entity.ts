import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UploadStatus {
  WAIT_FOR_LINKING = 'WAIT_FOR_LINKING',
  LINKED = 'LINKED',
}

export enum UploadType {
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  IMAGE = 'image',
}

@Entity()
export class Upload {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: UploadStatus,
    default: UploadStatus.WAIT_FOR_LINKING,
  })
  status: UploadStatus;

  @ApiProperty()
  @Column({ nullable: false })
  telegramMessageIdWithFile: number;

  @ApiProperty()
  @Column({ type: 'enum', enum: UploadType, nullable: false })
  type: UploadType;

  @ApiProperty()
  @Column()
  extension: string;

  @ApiPropertyOptional()
  @Column()
  originalName: string | null;

  @ApiPropertyOptional()
  @Column()
  filesize: number | null;

  @ApiProperty()
  url: string;

  @AfterLoad()
  afterLoad() {
    this.url = `/api/upload/${this.id}${this.extension}`;
  }
}
