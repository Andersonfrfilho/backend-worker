import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller, Injectable, Logger } from '@nestjs/common';
import { AsyncApiSub } from 'nestjs-asyncapi';

import type {
  MessageConsumerInterface,
  ConsumerMessage,
  ConsumerResult,
} from '../consumer.interface';
import { AuditEventMessage } from '../dto/consumer-messages.dto';

@Controller()
@Injectable()
export class AuditEventConsumer implements MessageConsumerInterface {
  constructor(private readonly logger: Logger) {}

  getId(): string {
    return 'audit-event-consumer';
  }

  getQueueName(): string {
    return 'audit.events';
  }

  @RabbitSubscribe({
    exchange: 'audit',
    routingKey: 'audit.events',
    queue: 'audit-events-queue',
  })
  @AsyncApiSub({
    channel: 'audit.events',
    summary: 'Registro de Auditoria e Logs de Segurança',
    description:
      'Este worker processa eventos críticos que precisam ser persistidos para fins de conformidade (compliance) e segurança.\n\n' +
      '### Topologia RabbitMQ\n' +
      '| Atributo | Valor |\n' +
      '| :--- | :--- |\n' +
      '| **Exchange** | `audit` (topic) |\n' +
      '| **Routing Key** | `audit.events` |\n' +
      '| **Queue** | `audit-events-queue` |\n' +
      '| **Ack** | Requerido (Manual) |\n\n' +
      '### Exemplo de Teste (cURL)\n' +
      'Utilize o comando abaixo para publicar um evento via RabbitMQ Management API:\n' +
      '```bash\n' +
      'curl -u guest:guest -H "Content-Type: application/json" -X POST \\\n' +
      '  -d \'{"properties":{},"routing_key":"audit.events","payload":"{\\"type\\":\\"user-created-audit\\",\\"userId\\":\\"123\\",\\"action\\":\\"create\\"}",\\"payload_encoding\\":\\"string\\"}\' \\\n' +
      '  http://localhost:15672/api/exchanges/%2f/audit/publish\n' +
      '```',
    message: {
      name: 'AuditEventMessage',
      payload: AuditEventMessage,
    },
    operationId: 'handleAuditEvent',
    bindings: {
      amqp: {
        ack: true,
      },
    },
  })
  async handleMessage(message: ConsumerMessage): Promise<ConsumerResult> {
    try {
      this.logger.log(`Processing audit event: ${JSON.stringify(message.body)}`);

      const { type, userId, email, createdAt, ipAddress, userAgent, action } = message.body;

      if (type === 'user-created-audit') {
        // Salvar no banco de auditoria ou enviar para sistema de logs
        this.logger.log(`Auditing user creation: ${userId} - ${email} - ${action}`);
        // TODO: Persistir no banco de auditoria
      }

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error processing audit event: ${error.message}`, error.stack);
      return {
        success: false,
        error,
        retry: true,
      };
    }
  }

  async process(message: ConsumerMessage): Promise<ConsumerResult> {
    return this.handleMessage(message);
  }

  async handleError(message: ConsumerMessage, error: Error): Promise<ConsumerResult> {
    this.logger.error(
      `Handling error for audit message: ${message.metadata?.correlationId}`,
      error.stack,
    );
    return {
      success: false,
      error,
      retry: true,
    };
  }

  async isHealthy(): Promise<boolean> {
    return true;
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
