import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { register as tsConfigPathsRegister } from 'tsconfig-paths';

import { AppErrorFactory } from '@modules/error';

import * as tsConfig from '../tsconfig.json';

import { AppModule } from './app.module';

const compilerOptions = tsConfig.compilerOptions;
tsConfigPathsRegister({
  baseUrl: compilerOptions.baseUrl,
  paths: compilerOptions.paths,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      forbidNonWhitelisted: false,
      transform: true,
      whitelist: true,
      skipMissingProperties: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => AppErrorFactory.fromValidationErrors(errors),
    }),
  );

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Como é um worker, não precisamos de servidor HTTP
  // Os consumidores RabbitMQ serão iniciados automaticamente
  await app.init();
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
