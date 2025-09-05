
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as express from 'express';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // استفاده از express.json() برای افزایش محدودیت سایز درخواست
  app.use(express.json({limit: '5mb'}));
  app.use(express.urlencoded({limit: '5mb', extended: true}));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
  }));

  // Enable CORS so the Vite dev server (frontend) can call this API during development
  app.enableCors({
    origin: [process.env.FRONTEND_ORIGIN || 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization'
  });

  const config = new DocumentBuilder()
    .setTitle('AI Test Platform API')
    .setDescription('API documentation for the AI Test Platform')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Also export the OpenAPI spec to JSON files for external use
  try {
    const spec = JSON.stringify(document, null, 2);
    // Write inside the package folder
    writeFileSync(join(process.cwd(), 'swagger.json'), spec);
    // Write at the monorepo root as well (one level up from backend-api)
    writeFileSync(join(process.cwd(), '..', 'swagger.json'), spec);
  } catch (err) {
    // Non-fatal: if writing fails, just continue running the app
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
