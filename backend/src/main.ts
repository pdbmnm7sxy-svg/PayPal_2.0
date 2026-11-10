import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('TransnationalBootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Transnational - Orchestration API')
    .setDescription(
      'Institutional Cross-Border Settlement, PayPal Sandbox Funding, Hyperledger Fabric Audit, and AI Optimization Engine',
    )
    .setVersion('1.0.0')
    .addTag('payments')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`=======================================================`);
  logger.log(` Transnational Backend is running on: http://localhost:${port}`);
  logger.log(` Swagger API documentation available at: http://localhost:${port}/docs`);
  logger.log(` WebSocket Real-Time Gateway active on port: ${port}`);
  logger.log(`=======================================================`);
}

bootstrap();
