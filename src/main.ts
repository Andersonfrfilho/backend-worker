import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AsyncApiModule, AsyncApiDocumentBuilder } from 'nestjs-asyncapi';
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

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService = app.get(ConfigService);
  const rabbitHost = configService.get('QUEUE_RABBITMQ_HOST') || 'localhost';
  const rabbitPort = configService.get('QUEUE_RABBITMQ_PORT') || '5672';
  const rabbitUser = configService.get('QUEUE_RABBITMQ_USER') || 'guest';

  // Configurar documentação AsyncAPI de forma profissional
  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Backend Worker - RabbitMQ')
    .setDescription(
      'Documentação técnica dos consumers (workers) que processam eventos via RabbitMQ.\n\n' +
        '### Topologia de Mensageria\n' +
        'Esta aplicação atua como um Worker consumindo mensagens de múltiplas exchanges. ' +
        'Utilize as abas abaixo para explorar os canais e payloads.',
    )
    .setVersion('1.0.0')
    .setDefaultContentType('application/json')
    .addServer('rabbitmq-broker', {
      url: `${rabbitHost}:${rabbitPort}`,
      protocol: 'amqp',
      description: 'Broker RabbitMQ principal',
      variables: {
        user: {
          default: rabbitUser,
          description: 'Usuário de conexão',
        },
      },
    })
    .build();

  const asyncapiDocument = await AsyncApiModule.createDocument(app, asyncApiOptions);
  await AsyncApiModule.setup('docs', app, asyncapiDocument);

  // Iniciar servidor HTTP para servir a documentação
  await app.listen(3005);
  console.log('🚀 Worker iniciado com documentação AsyncAPI em http://localhost:3005/docs');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
