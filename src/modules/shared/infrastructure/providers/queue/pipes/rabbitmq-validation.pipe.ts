import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

/**
 * Pipe de validação para mensagens do RabbitMQ
 * Transforma e valida payloads usando class-validator e class-transformer
 */
@Injectable()
export class RabbitMQValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    // Se não há tipo de metadados ou é um tipo nativo, retorna o valor
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }

    // Extrai o body da mensagem RabbitMQ
    const payload = value?.body || value;

    // Converte o plain object para uma instância da classe
    const object = plainToInstance(metadata.metatype, payload);

    // Valida o objeto
    const errors = await validate(object, {
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: true, // Lança erro se houver propriedades não permitidas
      transform: true, // Transforma tipos automaticamente
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed for message payload',
        errors: formattedErrors,
      });
    }

    // Retorna o objeto validado mantendo a estrutura original da mensagem
    if (value?.body) {
      return {
        ...value,
        body: object,
      };
    }

    return object;
  }

  /**
   * Verifica se o tipo deve ser validado
   */
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * Formata os erros de validação de forma legível
   */
  private formatErrors(errors: ValidationError[]): any[] {
    return errors.map((error) => ({
      field: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children?.length ? this.formatErrors(error.children) : undefined,
    }));
  }
}
