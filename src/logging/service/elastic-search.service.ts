import { Client } from '@elastic/elasticsearch';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { LoggingModuleOptions } from 'logging/types';
import { LOGGING_MODULE_OPTIONS } from '../constants/logging.constants';

@Injectable()
export class ElasticSearchService extends Client {
  constructor(
    @Optional() @Inject(LOGGING_MODULE_OPTIONS) loggingModuleOptions?: LoggingModuleOptions,
  ) {
    super(loggingModuleOptions.elasticConfig);
  }
}
