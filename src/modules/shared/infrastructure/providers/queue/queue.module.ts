import { Module } from '@nestjs/common';

import { AuditEventConsumer } from './consumer/implementations/audit-event.consumer';
import { CrmSyncConsumer } from './consumer/implementations/crm-sync.consumer';
import { EmailNotificationConsumer } from './consumer/implementations/email-notification.consumer';
import { SharedInfrastructureProviderQueueProducerModule } from './producer/producer.module';

@Module({
  imports: [SharedInfrastructureProviderQueueProducerModule],
  providers: [EmailNotificationConsumer, AuditEventConsumer, CrmSyncConsumer],
  exports: [SharedInfrastructureProviderQueueProducerModule],
})
export class SharedInfrastructureProviderQueueModule {}
