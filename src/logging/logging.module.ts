import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { LoggingService } from './service/logging.service';
import { LEVEL_OPTIONS, LOGGING_OPTIONS } from './constants/logging.constants';
import { LoggingModuleLevel } from './types';

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
          provide: LEVEL_OPTIONS,
          useValue: level,
        },
        {
          provide: LOGGING_OPTIONS,
          useFactory: async (configService: ConfigService) => configService.get('config'),
          inject: [ConfigService],
        },
        LoggingService,
      ],
      exports: [LOGGING_OPTIONS, LoggingService],
    };
  }
}
