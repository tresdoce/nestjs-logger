import { Injectable, LoggerService } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import pino from 'pino';
const pinoElasticSearch = require('pino-elasticsearch');
import { ElasitcSearchConfig, LoggingModuleLevel, LogType } from '../types';

@Injectable()
export class LoggingService implements LoggerService {
  private logger: pino.Logger;
  private readonly streamToElastic: any;
  constructor(isProd: boolean, level: LoggingModuleLevel, elasticConfig?: ElasitcSearchConfig) {
    if (isProd) {
      if (elasticConfig) {
        this.streamToElastic = pinoElasticSearch(elasticConfig);
        this.logger = pino({ level }, this.streamToElastic);
      } else {
        this.logger = pino({ level });
      }
    } else {
      this.logger = pino({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
        level,
      });
    }
  }
  readFile(pathSegment: string, filename: string) {
    const file = path.resolve(pathSegment, filename);
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }

  public log(message: any) {
    this.logger.info(message);
  }

  public info(message: any, context?: string) {
    const log = this.getGenericLog('info');
    log['message'] = message;
    context ? this.logger.info({ context }, log) : this.logger.info(log);
  }

  public error(message: any, context?: string) {
    const log = this.getGenericLog('error');
    log['message'] = message;
    context ? this.logger.error({ context }, log) : this.logger.error(log);
  }

  public warn(message: any, context?: string) {
    const log = this.getGenericLog('warn');
    log['message'] = message;
    context ? this.logger.warn({ context }, log) : this.logger.warn(log);
  }

  public fatal(message: any, context?: string) {
    const log = this.getGenericLog('fatal');
    log['message'] = message;
    context ? this.logger.fatal({ context }, log) : this.logger.fatal(log);
  }

  public debug(message: any, context?: string) {
    const log = this.getGenericLog('debug');
    log['message'] = message;
    context ? this.logger.debug({ context }, log) : this.logger.debug(log);
  }

  public trace(message: any, context?: string) {
    const log = this.getGenericLog('trace');
    log['message'] = message;
    context ? this.logger.trace({ context }, log) : this.logger.trace(log);
  }

  public getGenericLog(
    loggingLevel: LoggingModuleLevel,
    logType: LogType = 'DEFAULT',
    timestamp?: number,
  ): any {
    const packageInfo = this.readFile(__dirname, '../package.json');
    return {
      '@timestamp': timestamp ? timestamp : Date.now(),
      logger_name: packageInfo.name,
      log_level: loggingLevel.toUpperCase(),
      build_version: process.env.npm_package_version,
      build_parent_version: packageInfo.version,
      log_type: logType,
    };
  }
}
