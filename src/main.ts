import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from './common/config';
import { ValidationPipe } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fingerprint = require('express-fingerprint');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.use(helmet());
  app.use(
    Fingerprint({
      parameters: [
        Fingerprint.useragent,
        Fingerprint.acceptHeaders,
        Fingerprint.geoip,
      ],
    }),
  );
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  if (config.isDevelopment()) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Autotele API')
      .setDescription('Autotele API routes')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, document);
  }

  await app.listen(config.get<number>('PORT', 3000));
}

bootstrap();
