import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import * as _ from 'lodash';

import { LoggingService } from './service/logging.service';
import { LOGGING_MODULE_OPTIONS } from './constants/logging.constants';
import { LoggingModuleLevel } from './types';
import { ElasticSearchService } from './service/elastic-search.service';

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
            const {
              server: { isProd },
              elasticConfig,
            } = configService.get('config');
            return {
              level,
              isProd,
              elasticConfig,
            };
          },
          inject: [ConfigService],
        },
        LoggingService,
      ],
      exports: [LOGGING_MODULE_OPTIONS, LoggingService],
    };
  }

  static registerWithElastic(level: LoggingModuleLevel = 'info'): DynamicModule {
    return {
      global: true,
      module: LoggingModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: LOGGING_MODULE_OPTIONS,
          useFactory: async (configService: ConfigService) => {
            const {
              server: { isProd },
              elasticConfig,
            } = configService.get('config');
            return {
              level,
              isProd,
              elasticConfig,
            };
          },
          inject: [ConfigService],
        },
        LoggingService,
        ElasticSearchService,
      ],
      exports: [LOGGING_MODULE_OPTIONS, LoggingService, ElasticSearchService],
    };
  }
}
