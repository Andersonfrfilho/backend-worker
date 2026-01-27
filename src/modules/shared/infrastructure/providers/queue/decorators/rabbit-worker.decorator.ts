import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { applyDecorators, Injectable } from '@nestjs/common';

/**
 * Decorator para consumers RabbitMQ.
 *
 * Combina @Injectable e @RabbitSubscribe para criar um worker
 * que consome mensagens de uma fila RabbitMQ.
 *
 * @param options - Configurações do consumer (exchange, routingKey, queue)
 */
interface RabbitMQWorkerOptions {
  exchange: string;
  routingKey: string;
  queue: string;
  // Documentation metadata (used for manual docs)
  summary?: string;
  description?: string;
  messageType?: any;
  messageName?: string;
}

export function RabbitMQWorker(options: RabbitMQWorkerOptions) {
  return applyDecorators(
    Injectable(),
    RabbitSubscribe({
      exchange: options.exchange,
      routingKey: options.routingKey,
      queue: options.queue,
    }),
  );
}
