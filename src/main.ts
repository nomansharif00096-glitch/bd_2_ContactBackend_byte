import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow browser-based form submissions from any origin during testing.
  // Lock this down to your actual frontend domain(s) in production.
  app.enableCors({
    origin: true,
    methods: ['*'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Contact form backend running on http://localhost:${port}`);
}
bootstrap();
