import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import type {
  MessageConsumerInterface,
  ConsumerMessage,
  ConsumerResult,
} from '../consumer.interface';

@Injectable()
export class CrmSyncConsumer implements MessageConsumerInterface {
  private readonly logger = new Logger(CrmSyncConsumer.name);

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
