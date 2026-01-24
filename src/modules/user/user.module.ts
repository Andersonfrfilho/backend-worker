import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserAddress } from '@modules/shared/domain/entities/user-address.entity';
import { User } from '@modules/shared/domain/entities/user.entity';
import { SharedModule } from '@modules/shared/shared.module';

import { AddressModule } from '../address/address.module';
import { PhoneModule } from '../phone/phone.module';
import { CONNECTIONS_NAMES } from '../shared/infrastructure/providers/database/database.constant';

import { UserApplicationCreateUseCase } from './application/use-cases/create-user.use-case';
import { UserAddressRepository } from '@modules/shared/infrastructure/repositories/user-address.repository';
import { USER_ADDRESS_REPOSITORY_PROVIDE } from '@modules/shared/infrastructure/user-address.token';
import { UserRepository } from '@modules/shared/infrastructure/repositories/user.repository';
import {
  USER_CREATE_USE_CASE_PROVIDE,
  USER_REPOSITORY_PROVIDE,
} from '@modules/shared/infrastructure/user.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAddress], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
    PhoneModule,
    AddressModule,
  ],
  providers: [
    {
      provide: USER_REPOSITORY_PROVIDE,
      useClass: UserRepository,
    },
    {
      provide: USER_ADDRESS_REPOSITORY_PROVIDE,
      useClass: UserAddressRepository,
    },
    {
      provide: USER_CREATE_USE_CASE_PROVIDE,
      useClass: UserApplicationCreateUseCase,
    },
  ],
  exports: [USER_REPOSITORY_PROVIDE, USER_CREATE_USE_CASE_PROVIDE, USER_ADDRESS_REPOSITORY_PROVIDE],
})
export class UserModule {}
