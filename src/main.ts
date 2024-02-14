import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './@config/constants.config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './@filter/exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';

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

  const config = new DocumentBuilder()
    .setTitle('sewaXpress')
    .setDescription('sewaXpress API specification')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs/api', app, document);

  // Socket Documentation
  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('SewaXpress Backend')
    .setDescription('This is socket documentation.')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addSecurity('user-password', { type: 'userPassword' })
    .addServer('sewaXpress', {
      url: 'https://localhost:8848',
      protocol: 'socket.io',
    })
    .build();

  const asyncapiDocument = AsyncApiModule.createDocument(app, asyncApiOptions);
  await AsyncApiModule.setup('docs/socket', app, asyncapiDocument);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  });

  await app.listen(PORT);
}
bootstrap();
