# Backend Worker - RabbitMQ Documentation

This document describes the message consumers (workers) implemented in the backend worker application.

## 1. Email Notification Consumer
**Summary:** Envio de E-mails Transacionais  
**Description:** Este worker é responsável por processar a fila de e-mails e integrar com o provedor de SMTP.

### Topology
- **Exchange:** `notifications` (topic)
- **Routing Key:** `email.notifications`
- **Queue:** `email-notifications-queue`
- **Channel:** `email.notifications`

### Payload: `EmailNotificationMessage`
| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `type` | string | Tipo da notificação | `user-welcome` |
| `userId` | string | ID do usuário | `12345` |
| `email` | string | Email do usuário | `user@example.com` |
| `name` | string | Nome do usuário | `John Doe` |
| `template` | string | Template do email | `welcome-template` |

### Supported Flows
- `user-welcome`: Boas-vindas para novos usuários.
- `password-reset`: Link para recuperação de senha.
- `system-alert`: Notificações críticas de segurança.

---

## 2. CRM Sync Consumer
**Summary:** Sincronização de Dados com CRM Externo  
**Description:** Este worker garante que as alterações cadastrais do usuário sejam replicadas para o CRM (Salesforce/Hubspot).

### Topology
- **Exchange:** `integration` (topic)
- **Routing Key:** `crm.sync`
- **Queue:** `crm-sync-queue`
- **Channel:** `crm.sync`

### Payload: `CrmSyncMessage`
| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `type` | string | Tipo da sincronização | `crm-user-sync` |
| `userId` | string | ID do usuário | `12345` |
| `email` | string | Email do usuário | `user@example.com` |
| `name` | string | Nome do usuário | `John Doe` |
| `phone` | string | Telefone do usuário | `+5511999999999` |
| `address` | object | Endereço do usuário | - |

---

## 3. Audit Event Consumer
**Summary:** Registro de Auditoria e Logs de Segurança  
**Description:** Este worker processa eventos críticos que precisam ser persistidos para fins de conformidade (compliance) e segurança.

### Topology
- **Exchange:** `audit` (topic)
- **Routing Key:** `audit.events`
- **Queue:** `audit-events-queue`
- **Channel:** `audit.events`

### Payload: `AuditEventMessage`
| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `type` | string | Tipo do evento | `user-created-audit` |
| `userId` | string | ID do usuário | `12345` |
| `email` | string | Email do usuário | `user@example.com` |
| `createdAt` | string | Data de criação | - |
| `ipAddress` | string | Endereço IP | `192.168.1.1` |
| `userAgent` | string | User Agent | `Mozilla/5.0...` |
| `action` | string | Ação realizada | `user_created` |
