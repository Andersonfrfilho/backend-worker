import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import type {
  MessageConsumerInterface,
  ConsumerMessage,
  ConsumerResult,
} from '../consumer.interface';

@Injectable()
export class AuditEventConsumer implements MessageConsumerInterface {
  private readonly logger = new Logger(AuditEventConsumer.name);

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
