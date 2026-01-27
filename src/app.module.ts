import { Module } from '@nestjs/common';
import { register as tsConfigPathsRegister } from 'tsconfig-paths';

import { ConfigModule } from '@config/config.module';
import { ErrorModule } from '@modules/error/error.module';

import * as tsConfig from '../tsconfig.json';

import { SharedModule } from './modules/shared/shared.module';

const compilerOptions = tsConfig.compilerOptions;
tsConfigPathsRegister({
  baseUrl: compilerOptions.baseUrl,
  paths: compilerOptions.paths,
});

@Module({
  imports: [ConfigModule, SharedModule, ErrorModule],
})
export class AppModule {}
