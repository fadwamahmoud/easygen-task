import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const swagConfig = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Authentication module API documentation')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, swagConfig);
  SwaggerModule.setup('docs', app, document);


  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);

  app.use(helmet());

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', { infer: true }),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown fields
      forbidNonWhitelisted: true, // rejects unknown fields
      transform: true, // transforms payloads to DTO instances
    }),
  );

  const port = config.get<number>('PORT', { infer: true }) ?? 3001;
  await app.listen(port);
}
bootstrap();