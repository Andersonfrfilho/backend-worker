import { BadRequestException } from '@nestjs/common';
import { RabbitMQValidationPipe } from '../rabbitmq-validation.pipe';
import { EmailNotificationMessage } from '../../consumer/dto/consumer-messages.dto';

describe('RabbitMQValidationPipe', () => {
  let pipe: RabbitMQValidationPipe;

  beforeEach(() => {
    pipe = new RabbitMQValidationPipe();
  });

  describe('transform', () => {
    it('deve validar e transformar uma mensagem válida', async () => {
      const validMessage = {
        body: {
          type: 'user-welcome',
          userId: '12345',
          email: 'test@example.com',
          name: 'John Doe',
        },
      };

      const result = await pipe.transform(validMessage, {
        type: 'body',
        metatype: EmailNotificationMessage,
        data: '',
      });

      expect(result.body).toBeInstanceOf(EmailNotificationMessage);
      expect(result.body.type).toBe('user-welcome');
      expect(result.body.email).toBe('test@example.com');
    });

    it('deve lançar erro quando type está ausente', async () => {
      const invalidMessage = {
        body: {
          userId: '12345',
          email: 'test@example.com',
        },
      };

      await expect(
        pipe.transform(invalidMessage, {
          type: 'body',
          metatype: EmailNotificationMessage,
          data: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro quando email é inválido', async () => {
      const invalidMessage = {
        body: {
          type: 'user-welcome',
          userId: '12345',
          email: 'invalid-email',
        },
      };

      await expect(
        pipe.transform(invalidMessage, {
          type: 'body',
          metatype: EmailNotificationMessage,
          data: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro quando type não é um valor do enum', async () => {
      const invalidMessage = {
        body: {
          type: 'invalid-type',
          userId: '12345',
          email: 'test@example.com',
        },
      };

      await expect(
        pipe.transform(invalidMessage, {
          type: 'body',
          metatype: EmailNotificationMessage,
          data: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve aceitar campos opcionais como undefined', async () => {
      const validMessage = {
        body: {
          type: 'user-welcome',
          userId: '12345',
          email: 'test@example.com',
        },
      };

      const result = await pipe.transform(validMessage, {
        type: 'body',
        metatype: EmailNotificationMessage,
        data: '',
      });

      expect(result.body).toBeInstanceOf(EmailNotificationMessage);
      expect(result.body.name).toBeUndefined();
      expect(result.body.template).toBeUndefined();
    });

    it('deve remover propriedades não permitidas (whitelist)', async () => {
      const messageWithExtraFields = {
        body: {
          type: 'user-welcome',
          userId: '12345',
          email: 'test@example.com',
          extraField: 'should be removed',
          anotherExtra: 123,
        },
      };

      await expect(
        pipe.transform(messageWithExtraFields, {
          type: 'body',
          metatype: EmailNotificationMessage,
          data: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve validar mensagem sem wrapper body', async () => {
      const validMessage = {
        type: 'user-welcome',
        userId: '12345',
        email: 'test@example.com',
      };

      const result = await pipe.transform(validMessage, {
        type: 'body',
        metatype: EmailNotificationMessage,
        data: '',
      });

      expect(result).toBeInstanceOf(EmailNotificationMessage);
      expect(result.type).toBe('user-welcome');
    });

    it('deve lançar erro com detalhes formatados', async () => {
      const invalidMessage = {
        body: {
          type: 'invalid-type',
          userId: '12345',
          email: 'invalid-email',
        },
      };

      try {
        await pipe.transform(invalidMessage, {
          type: 'body',
          metatype: EmailNotificationMessage,
          data: '',
        });
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        const response = error.getResponse() as any;
        expect(response.message).toBe('Validation failed for message payload');
        expect(response.errors).toBeDefined();
        expect(Array.isArray(response.errors)).toBe(true);
      }
    });
  });
});
