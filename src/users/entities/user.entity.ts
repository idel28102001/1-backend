import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Bot } from '../../bots/entities/bot.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ nullable: true })
  firstName: string;

  @ApiProperty()
  @Column({ nullable: true })
  lastName: string;

  @ApiProperty()
  @Index()
  @Column()
  phone: string;

  @ApiProperty()
  @Column({ nullable: true })
  email: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true, select: false })
  telegramSession: string;

  @Column({ nullable: true, select: false })
  phoneCodeHash: string;

  @Column({ nullable: true, select: false })
  password: string;

  @OneToMany(() => Bot, (bots) => bots.user, {
    cascade: ['remove'],
  })
  bots: Bot[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10, 'a');
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @Column({ nullable: false, default: false })
  isEmailConfirmed: boolean;
}
