import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller, Injectable, Logger, UsePipes } from '@nestjs/common';
import { AsyncApiSub } from 'nestjs-asyncapi';

import { RabbitMQValidationPipe } from '../../pipes/rabbitmq-validation.pipe';
import type {
  MessageConsumerInterface,
  ConsumerMessage,
  ConsumerResult,
} from '../consumer.interface';
import { EmailNotificationMessage } from '../dto/consumer-messages.dto';

@Controller()
@Injectable()
export class EmailNotificationConsumer
  implements MessageConsumerInterface<EmailNotificationMessage>
{
  constructor(private readonly logger: Logger) {}

  getId(): string {
    return 'email-notification-consumer';
  }

  getQueueName(): string {
    return 'email.notifications';
  }

  @RabbitSubscribe({
    exchange: 'notifications',
    routingKey: 'email.notifications',
    queue: 'email-notifications-queue',
  })
  @UsePipes(new RabbitMQValidationPipe())
  @AsyncApiSub({
    channel: 'email.notifications',
    summary: 'Envio de E-mails Transacionais',
    description:
      'Este worker é responsável por processar a fila de e-mails e integrar com o provedor de SMTP.\n\n' +
      '### Detalhes Técnicos\n' +
      '| Atributo | Valor |\n' +
      '| :--- | :--- |\n' +
      '| **Exchange** | `notifications` (topic) |\n' +
      '| **Routing Key** | `email.notifications` |\n' +
      '| **Queue** | `email-notifications-queue` |\n' +
      '| **Retry Strategy** | 3 tentativas com Backoff Exponencial |\n\n' +
      '### Fluxos Suportados\n' +
      '- `user-welcome`: Boas-vindas para novos usuários.\n' +
      '- `password-reset`: Link para recuperação de senha.\n' +
      '- `system-alert`: Notificações críticas de segurança.\n\n' +
      '### Exemplo de Teste (cURL)\n' +
      '```bash\n' +
      'curl -u guest:guest -H "Content-Type: application/json" -X POST \\\n' +
      '  -d \'{"properties":{},"routing_key":"email.notifications","payload":"{\\"type\\":\\"user-welcome\\",\\"userId\\":\\"123\\",\\"email\\":\\"welcome@teste.com\\"}",\\"payload_encoding\\":\\"string\\"}\' \\\n' +
      '  http://localhost:15672/api/exchanges/%2f/notifications/publish\n' +
      '```',
    message: {
      name: 'EmailNotificationMessage',
      payload: EmailNotificationMessage,
    },
    operationId: 'handleEmailNotification',
    bindings: {
      amqp: {
        ack: true,
      },
    },
  })
  async handleMessage(message: ConsumerMessage<EmailNotificationMessage>): Promise<ConsumerResult> {
    try {
      this.logger.log(`Processing email notification: ${JSON.stringify(message.body)}`);

      // Aqui você implementa a lógica para enviar email
      // Ex.: usar um serviço de email como SendGrid, SES, etc.

      const { type, userId, email } = message.body;

      if (type === 'user-welcome') {
        // Enviar email de boas-vindas
        this.logger.log(`Sending welcome email to ${email} for user ${userId}`);
        // TODO: Integrar com serviço de email
        await Promise.resolve(); // Placeholder para futura integração assíncrona
      }

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error processing email notification: ${error.message}`, error.stack);
      return {
        success: false,
        error,
        retry: true,
      };
    }
  }

  async process(message: ConsumerMessage<EmailNotificationMessage>): Promise<ConsumerResult> {
    return this.handleMessage(message);
  }

  async handleError(message: ConsumerMessage, error: Error): Promise<ConsumerResult> {
    this.logger.error(
      `Handling error for message: ${message.metadata?.correlationId}`,
      error.stack,
    );
    await Promise.resolve(); // Placeholder para futura lógica assíncrona
    return {
      success: false,
      error,
      retry: true,
    };
  }

  async isHealthy(): Promise<boolean> {
    // Verificar se o serviço de email está disponível
    return await Promise.resolve(true);
  }

  getMetrics() {
    return {
      totalProcessed: 0,
      totalFailed: 0,
      totalRetried: 0,
      averageProcessingTime: 0,
      uptime: 0,
    };
  }
}
