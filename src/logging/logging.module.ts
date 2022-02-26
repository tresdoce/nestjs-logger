import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import * as _ from 'lodash';

import { LoggingService } from './service/logging.service';
import { LOGGING_SERVICE } from './constants/logging.constants';
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
          provide: LOGGING_SERVICE,
          useFactory: async (configService: ConfigService) => {
            const config = configService.get('config');
            const isProd = Boolean(config['server']['isProd']);
            const elasticConfig: ElasticSearchConfig =
              _.isUndefined(config['elasticConfig']) || _.isEmpty(config['elasticConfig'])
                ? null
                : config['elasticConfig'];
            return new LoggingService(isProd, level, elasticConfig);
          },
          inject: [ConfigService],
        },
      ],
      exports: [LOGGING_SERVICE],
    };
  }
}
