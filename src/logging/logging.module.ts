import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import * as _ from 'lodash';

import { LoggingService } from './service/logging.service';
import { LOGGING_MODULE_OPTIONS } from './constants/logging.constants';
import { ElasticSearchConfig, LoggingModuleLevel } from './types';

@Global()
@Module({})
export class LoggingModule {
  static register(level: LoggingModuleLevel = 'info'): DynamicModule {
    return {
      global: true,
      module: LoggingModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: LOGGING_MODULE_OPTIONS,
          useFactory: async (configService: ConfigService) => {
            const config = configService.get('config');
            return {
              config,
              level,
            };
          },
          inject: [ConfigService],
        },
        LoggingService,
      ],
      exports: [LOGGING_MODULE_OPTIONS, LoggingService],
    };
  }
}
