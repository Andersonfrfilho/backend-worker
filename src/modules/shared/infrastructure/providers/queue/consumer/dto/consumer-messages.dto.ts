import { ApiProperty } from '@nestjs/swagger';

export class EmailNotificationMessage {
  @ApiProperty({ example: 'user-welcome', description: 'Tipo da notificação' })
  type: string;

  @ApiProperty({ example: '12345', description: 'ID do usuário' })
  userId: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Nome do usuário' })
  name?: string;

  @ApiProperty({ example: 'welcome-template', description: 'Template do email' })
  template?: string;
}

export class AuditEventMessage {
  @ApiProperty({ example: 'user-created-audit', description: 'Tipo do evento' })
  type: string;

  @ApiProperty({ example: '12345', description: 'ID do usuário' })
  userId: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  email?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt?: string;

  @ApiProperty({ example: '192.168.1.1', description: 'Endereço IP' })
  ipAddress?: string;

  @ApiProperty({ example: 'Mozilla/5.0...', description: 'User Agent' })
  userAgent?: string;

  @ApiProperty({ example: 'user_created', description: 'Ação realizada' })
  action?: string;
}

export class CrmSyncMessage {
  @ApiProperty({ example: 'crm-user-sync', description: 'Tipo da sincronização' })
  type: string;

  @ApiProperty({ example: '12345', description: 'ID do usuário' })
  userId: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  email?: string;

  @ApiProperty({ example: 'John Doe', description: 'Nome do usuário' })
  name?: string;

  @ApiProperty({ example: '+5511999999999', description: 'Telefone do usuário' })
  phone?: string;

  @ApiProperty({ description: 'Endereço do usuário' })
  address?: object;
}
