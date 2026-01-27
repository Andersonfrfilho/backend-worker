import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';

import type { LogProviderInterface } from '@modules/shared/domain';
import { LOG_PROVIDER } from '@modules/shared/infrastructure/providers/log/log.token';

@Injectable()
export class RabbitMQLoggingInterceptor implements NestInterceptor {
  constructor(@Inject(LOG_PROVIDER) private readonly logProvider: LogProviderInterface) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;

    // Log da entrada do método
    this.logProvider.info({
      message: `RabbitMQ consumer method started`,
      context: 'RabbitMQLoggingInterceptor',
      params: {
        class: className,
        method: methodName,
      },
    });

    const startTime = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;

        // Log de sucesso
        this.logProvider.info({
          message: `RabbitMQ consumer method completed successfully`,
          context: 'RabbitMQLoggingInterceptor',
          params: {
            class: className,
            method: methodName,
            duration: `${duration}ms`,
            response: typeof response === 'object' ? JSON.stringify(response) : String(response),
          },
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Log de erro
        this.logProvider.error({
          message: `RabbitMQ consumer method failed`,
          context: 'RabbitMQLoggingInterceptor',
          params: {
            class: className,
            method: methodName,
            duration: `${duration}ms`,
            error: error.message || String(error),
            stack: error.stack,
          },
        });

        throw error;
      }),
    );
  }
}
