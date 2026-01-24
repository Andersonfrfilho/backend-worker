import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

import type {
  MessageConsumerInterface,
  ConsumerMessage,
  ConsumerResult,
} from '../consumer.interface';

@Injectable()
export class EmailNotificationConsumer implements MessageConsumerInterface {
  private readonly logger = new Logger(EmailNotificationConsumer.name);

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
  async handleMessage(message: ConsumerMessage): Promise<ConsumerResult> {
    try {
      this.logger.log(`Processing email notification: ${JSON.stringify(message.body)}`);

      // Aqui você implementa a lógica para enviar email
      // Ex.: usar um serviço de email como SendGrid, SES, etc.

      const { type, userId, email, name, template } = message.body;

      if (type === 'user-welcome') {
        // Enviar email de boas-vindas
        this.logger.log(`Sending welcome email to ${email} for user ${userId}`);
        // TODO: Integrar com serviço de email
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

  async process(message: ConsumerMessage): Promise<ConsumerResult> {
    return this.handleMessage(message);
  }

  async handleError(message: ConsumerMessage, error: Error): Promise<ConsumerResult> {
    this.logger.error(
      `Handling error for message: ${message.metadata?.correlationId}`,
      error.stack,
    );
    return {
      success: false,
      error,
      retry: true,
    };
  }

  async isHealthy(): Promise<boolean> {
    // Verificar se o serviço de email está disponível
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
