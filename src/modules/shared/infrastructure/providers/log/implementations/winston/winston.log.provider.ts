import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

import { LOG_LEVEL, LogBaseParams, LogProviderInterface } from '@app/modules/shared/domain';

export class WinstonLogProvider implements LogProviderInterface {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly loggerWinston: WinstonLogger,
  ) {}

  debug(params?: LogBaseParams) {
    this.loggerWinston.log({
      ...params,
      level: LOG_LEVEL.DEBUG,
    });
  }

  info(params?: LogBaseParams) {
    this.loggerWinston.log({
      ...params,
      level: LOG_LEVEL.INFO,
    });
  }

  error(params?: LogBaseParams) {
    this.loggerWinston.error({
      ...params,
    });
  }

  warn(params?: LogBaseParams) {
    this.loggerWinston.warn({
      ...params,
    });
  }
}
