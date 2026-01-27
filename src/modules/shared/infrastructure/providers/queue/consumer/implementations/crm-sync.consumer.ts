import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller, Injectable, Logger } from '@nestjs/common';
import { AsyncApiSub } from 'nestjs-asyncapi';

import type {
  MessageConsumerInterface,
  ConsumerMessage,
  ConsumerResult,
} from '../consumer.interface';
import { CrmSyncMessage } from '../dto/consumer-messages.dto';

@Controller()
@Injectable()
export class CrmSyncConsumer implements MessageConsumerInterface {
  constructor(private readonly logger: Logger) {}

  getId(): string {
    return 'crm-sync-consumer';
  }

  getQueueName(): string {
    return 'crm.sync';
  }

  @RabbitSubscribe({
    exchange: 'integration',
    routingKey: 'crm.sync',
    queue: 'crm-sync-queue',
  })
  @AsyncApiSub({
    channel: 'crm.sync',
    summary: 'Sincronização de Dados com CRM Externo',
    description:
      'Este worker garante que as alterações cadastrais do usuário sejam replicadas para o CRM (Salesforce/Hubspot).\n\n' +
      '### Topologia RabbitMQ\n' +
      '| Atributo | Valor |\n' +
      '| :--- | :--- |\n' +
      '| **Exchange** | `integration` (topic) |\n' +
      '| **Routing Key** | `crm.sync` |\n' +
      '| **Queue** | `crm-sync-queue` |\n' +
      '| **Retentativa** | Fila de DLQ configurada |\n\n' +
      '### Exemplo de Teste (cURL)\n' +
      '```bash\n' +
      'curl -u guest:guest -H "Content-Type: application/json" -X POST \\\n' +
      '  -d \'{"properties":{},"routing_key":"crm.sync","payload":"{\\"type\\":\\"crm-user-sync\\",\\"userId\\":\\"123\\",\\"email\\":\\"user@exemplo.com\\",\\"name\\":\\"João Silva\\"}",\\"payload_encoding\\":\\"string\\"}\' \\\n' +
      '  http://localhost:15672/api/exchanges/%2f/integration/publish\n' +
      '```',
    message: {
      name: 'CrmSyncMessage',
      payload: CrmSyncMessage,
    },
    operationId: 'handleCrmSync',
    bindings: {
      amqp: {
        ack: true,
      },
    },
  })
  async handleMessage(message: ConsumerMessage): Promise<ConsumerResult> {
    try {
      this.logger.log(`Processing CRM sync: ${JSON.stringify(message.body)}`);

      const { type, userId, email, name, phone, address } = message.body;

      if (type === 'crm-user-sync') {
        // Sincronizar com sistema CRM
        this.logger.log(`Syncing user ${userId} to CRM: ${name} - ${email}`);
        // TODO: Integrar com API do CRM
      }

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error processing CRM sync: ${error.message}`, error.stack);
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
      `Handling error for CRM sync message: ${message.metadata?.correlationId}`,
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
