import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Upload } from '../../upload/entities/upload.entity';

@Entity('bots')
export class Bot {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  readonly createdAt: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  name: string;

  @ApiProperty()
  @Column({ readonly: true })
  readonly username: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  description: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  aboutText: string;

  @ApiPropertyOptional()
  @OneToOne(() => Upload)
  @JoinColumn()
  userPic: Upload;

  @Column({ nullable: true, select: false })
  token: string;

  @ApiProperty()
  @Column()
  link: string;

  @ManyToOne(() => User, (user) => user.bots, { nullable: false })
  user: User;
}
