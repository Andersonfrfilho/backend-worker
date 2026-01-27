import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

enum EmailNotificationType {
  USER_WELCOME = 'user-welcome',
  PASSWORD_RESET = 'password-reset',
  SYSTEM_ALERT = 'system-alert',
}

export class EmailNotificationMessage {
  @ApiProperty({
    example: 'user-welcome',
    description: 'Tipo da notificação',
    enum: EmailNotificationType,
  })
  @IsNotEmpty({ message: 'O campo type é obrigatório' })
  @IsEnum(EmailNotificationType, { message: 'Tipo de notificação inválido' })
  type: string;

  @ApiProperty({ example: '12345', description: 'ID do usuário' })
  @IsNotEmpty({ message: 'O campo userId é obrigatório' })
  @IsString({ message: 'O userId deve ser uma string' })
  @MaxLength(100, { message: 'O userId deve ter no máximo 100 caracteres' })
  userId: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsNotEmpty({ message: 'O campo email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Nome do usuário' })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
  @MaxLength(200, { message: 'O nome deve ter no máximo 200 caracteres' })
  name?: string;

  @ApiProperty({ example: 'welcome-template', description: 'Template do email' })
  @IsOptional()
  @IsString({ message: 'O template deve ser uma string' })
  @MaxLength(100, { message: 'O template deve ter no máximo 100 caracteres' })
  template?: string;
}

export class AuditEventMessage {
  @ApiProperty({ example: 'user-created-audit', description: 'Tipo do evento' })
  @IsNotEmpty({ message: 'O campo type é obrigatório' })
  @IsString({ message: 'O type deve ser uma string' })
  type: string;

  @ApiProperty({ example: '12345', description: 'ID do usuário' })
  @IsNotEmpty({ message: 'O campo userId é obrigatório' })
  @IsString({ message: 'O userId deve ser uma string' })
  @MaxLength(100, { message: 'O userId deve ter no máximo 100 caracteres' })
  userId: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiProperty({ description: 'Data de criação' })
  @IsOptional()
  @IsString({ message: 'A data deve ser uma string' })
  createdAt?: string;

  @ApiProperty({ example: '192.168.1.1', description: 'Endereço IP' })
  @IsOptional()
  @IsString({ message: 'O IP deve ser uma string' })
  @MaxLength(50, { message: 'O IP deve ter no máximo 50 caracteres' })
  ipAddress?: string;

  @ApiProperty({ example: 'Mozilla/5.0...', description: 'User Agent' })
  @IsOptional()
  @IsString({ message: 'O userAgent deve ser uma string' })
  @MaxLength(500, { message: 'O userAgent deve ter no máximo 500 caracteres' })
  userAgent?: string;

  @ApiProperty({ example: 'user_created', description: 'Ação realizada' })
  @IsOptional()
  @IsString({ message: 'A action deve ser uma string' })
  @MaxLength(100, { message: 'A action deve ter no máximo 100 caracteres' })
  action?: string;
}

export class CrmSyncMessage {
  @ApiProperty({ example: 'crm-user-sync', description: 'Tipo da sincronização' })
  @IsNotEmpty({ message: 'O campo type é obrigatório' })
  @IsString({ message: 'O type deve ser uma string' })
  type: string;

  @ApiProperty({ example: '12345', description: 'ID do usuário' })
  @IsNotEmpty({ message: 'O campo userId é obrigatório' })
  @IsString({ message: 'O userId deve ser uma string' })
  @MaxLength(100, { message: 'O userId deve ter no máximo 100 caracteres' })
  userId: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsNotEmpty({ message: 'O campo email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiProperty({ example: 'John Doe', description: 'Nome do usuário' })
  name?: string;

  @ApiProperty({ example: '+5511999999999', description: 'Telefone do usuário' })
  phone?: string;

  @ApiProperty({ description: 'Endereço do usuário' })
  address?: object;
}
