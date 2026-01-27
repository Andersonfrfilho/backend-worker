import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';

import { LogProviderInterface } from '@modules/shared/domain';
import { LOG_PROVIDER } from '@modules/shared/infrastructure/providers/log/log.token';
import { RabbitMQLoggingInterceptor } from './rabbitmq-logging.interceptor';

describe('RabbitMQLoggingInterceptor - Unit Tests', () => {
  let interceptor: RabbitMQLoggingInterceptor;
  let mockLogProvider: jest.Mocked<LogProviderInterface>;
  let mockContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;

  beforeEach(async () => {
    const mockLogProviderImplementation = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQLoggingInterceptor,
        {
          provide: LOG_PROVIDER,
          useValue: mockLogProviderImplementation,
        },
      ],
    }).compile();

    interceptor = module.get<RabbitMQLoggingInterceptor>(RabbitMQLoggingInterceptor);
    mockLogProvider = module.get(LOG_PROVIDER);

    // Mock ExecutionContext
    mockContext = {
      getType: jest.fn(),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    // Mock CallHandler
    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    beforeEach(() => {
      mockContext.getHandler.mockReturnValue({ name: 'testMethod' });
      mockContext.getClass.mockReturnValue({ name: 'TestConsumer' });
    });

    it('should log RabbitMQ method start and success', (done) => {
      const mockResponse = { result: 'success' };
      mockCallHandler.handle.mockReturnValue(of(mockResponse));

      const result = interceptor.intercept(mockContext, mockCallHandler);
      const observable = result;

      observable.subscribe(() => {
        expect(mockLogProvider.info).toHaveBeenCalledTimes(2);
        expect(mockLogProvider.info).toHaveBeenNthCalledWith(1, {
          message: 'RabbitMQ consumer method started',
          context: 'RabbitMQLoggingInterceptor',
          params: {
            class: 'TestConsumer',
            method: 'testMethod',
          },
        });
        expect(mockLogProvider.info).toHaveBeenNthCalledWith(2, {
          message: 'RabbitMQ consumer method completed successfully',
          context: 'RabbitMQLoggingInterceptor',
          params: {
            class: 'TestConsumer',
            method: 'testMethod',
            duration: expect.stringMatching(/\d+ms/),
            response: JSON.stringify(mockResponse),
          },
        });
        expect(mockLogProvider.error).not.toHaveBeenCalled();
        done();
      });
    });

    it('should log RabbitMQ method start and error', (done) => {
      const mockError = new Error('Test error');
      mockCallHandler.handle.mockReturnValue(throwError(() => mockError));

      const result = interceptor.intercept(mockContext, mockCallHandler);
      const observable = result;

      observable.subscribe({
        next: () => fail('Should not emit next'),
        error: (error) => {
          expect(error).toBe(mockError);
          expect(mockLogProvider.info).toHaveBeenCalledTimes(1);
          expect(mockLogProvider.info).toHaveBeenCalledWith({
            message: 'RabbitMQ consumer method started',
            context: 'RabbitMQLoggingInterceptor',
            params: {
              class: 'TestConsumer',
              method: 'testMethod',
            },
          });
          expect(mockLogProvider.error).toHaveBeenCalledTimes(1);
          expect(mockLogProvider.error).toHaveBeenCalledWith({
            message: 'RabbitMQ consumer method failed',
            context: 'RabbitMQLoggingInterceptor',
            params: {
              class: 'TestConsumer',
              method: 'testMethod',
              duration: expect.stringMatching(/\d+ms/),
              error: 'Test error',
              stack: mockError.stack,
            },
          });
          done();
        },
      });
    });

    it('should handle non-object responses', (done) => {
      const mockResponse = 'string response';
      mockCallHandler.handle.mockReturnValue(of(mockResponse));

      const result = interceptor.intercept(mockContext, mockCallHandler);
      const observable = result;

      observable.subscribe(() => {
        expect(mockLogProvider.info).toHaveBeenCalledTimes(2);
        expect(mockLogProvider.info).toHaveBeenNthCalledWith(2, {
          message: 'RabbitMQ consumer method completed successfully',
          context: 'RabbitMQLoggingInterceptor',
          params: {
            class: 'TestConsumer',
            method: 'testMethod',
            duration: expect.stringMatching(/\d+ms/),
            response: 'string response',
          },
        });
        done();
      });
    });
  });
});
