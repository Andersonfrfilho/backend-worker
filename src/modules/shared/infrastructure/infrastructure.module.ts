import { Module } from '@nestjs/common';

import { SharedInfrastructureProviderModule } from './providers/provider.module';
import { SharedInfrastructureQueueInterceptorsModule } from './providers/queue/interceptors/queue-interceptors.module';
import { SharedRepositoriesModule } from './repositories/repositories.module';

@Module({
  imports: [
    SharedInfrastructureProviderModule,
    SharedInfrastructureQueueInterceptorsModule,
    SharedRepositoriesModule,
  ],
  exports: [
    SharedInfrastructureProviderModule,
    SharedInfrastructureQueueInterceptorsModule,
    SharedRepositoriesModule,
  ],
})
export class SharedInfrastructureModule {}
