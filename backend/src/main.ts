import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Bug #9 fix: fail fast if required JWT secrets are missing in production
  if (process.env.NODE_ENV === 'production') {
    const requiredSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = requiredSecrets.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      logger.error(
        `FATAL: Missing required environment variables: ${missing.join(', ')}`,
      );
      process.exit(1);
    }
  } else if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    logger.warn(
      '⚠️  JWT_SECRET / JWT_REFRESH_SECRET not set — using insecure defaults. Set these in .env!',
    );
  }

  const app = await NestFactory.create(AppModule, { cors: false });

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Campus Lost & Found API')
    .setDescription(
      'Smart Campus Lost & Found System — Real-time secure communication platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('items', 'Lost & Found item management')
    .addTag('matches', 'Intelligent item matching')
    .addTag('chat', 'Real-time chat rooms')
    .addTag('claims', 'Claim verification workflow')
    .addTag('notifications', 'Notification management')
    .addTag('admin', 'Admin analytics & moderation')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application running on: http://localhost:${port}/api`);
  logger.log(`📚 Swagger docs at: http://localhost:${port}/api/docs`);
}

void bootstrap();
