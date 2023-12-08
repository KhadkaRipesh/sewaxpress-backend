import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './@config/constants.config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './@filter/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  // Using filter for exception
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(PORT);
}
bootstrap();
