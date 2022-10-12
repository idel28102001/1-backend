import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export class Config {
  private config: ConfigService;

  constructor() {
    this.config = new ConfigService();
  }

  public get<T = any>(propertyPath: string, defaultValue?: T) {
    return this.config.get(propertyPath, defaultValue);
  }

  public isDevelopment() {
    return this.get<string>('NODE_ENV') === 'development';
  }

  public isProduction() {
    return this.get<string>('NODE_ENV') === 'production';
  }

  getFrontendUrl() {
    return this.get('FRONTEND_URL');
  }

  public getDatabaseOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.get('DB_HOST'),
      port: this.get('DB_PORT'),
      username: this.get('DB_USERNAME'),
      password: this.get('DB_PASSWORD'),
      database: this.get('DB_NAME'),
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }

  getTelegramConfig() {
    return {
      apiId: parseInt(this.get<number>('TELEGRAM_API_ID')),
      apiHash: this.get<string>('TELEGRAM_API_HASH'),
    };
  }

  getJwtConfig() {
    return {
      secret: this.get('JWT_SECRET'),
      signOptions: { expiresIn: this.get('JWT_EXPIRES') },
    };
  }

  getJwtRefreshExpires() {
    return parseInt(this.get('JWT_REFRESH_EXPIRES', 9600));
  }

  getEmailOptions() {
    return {
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: this.get('EMAIL_LOGIN'),
        pass: this.get('EMAIL_PASSWORD'),
      },
    };
  }

  getFileStoreBotConfig() {
    return {
      adminPhone: this.get('TELEGRAM_ADMIN_PHONE'),
      botUsername: this.get('TELEGRAM_FILE_STORE_BOT_USERNAME'),
      botToken: this.get('TELEGRAM_FILE_STORE_BOT_TOKEN'),
    };
  }

  getUploadOptions(): MulterOptions {
    return {
      dest: '/tmp',
      limits: { fileSize: 50_000_000 }, // 50 Mb
    };
  }
}

export const config = new Config();
