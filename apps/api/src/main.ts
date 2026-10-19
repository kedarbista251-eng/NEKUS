import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { loadConfig } from '@nexus/config';
import { createLogger } from '@nexus/observability';

async function bootstrap() {
  const config = loadConfig();
  const logger = createLogger('nexus-api');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Security headers & CORS
  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // OpenAPI/Swagger specification
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NEXUS Platform API')
    .setDescription('Autonomous Cloud Operations and Intelligence Platform API specification')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('v1/docs', app, document);

  await app.listen(config.PORT);
  logger.info(`NEXUS API online on port ${config.PORT}. Documentation available at /v1/docs`);
}

bootstrap().catch((err) => {
  console.error('[NEXUS API BOOTSTRAP FATAL]', err);
  process.exit(1);
});
