import { ExecutionContext, HttpStatus, Inject, Injectable, LoggerService } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';
import pino from 'pino';
const pinoElasticSearch = require('pino-elasticsearch');
const pinoMultiStream = require('pino-multi-stream').multistream;

import { LEVEL_OPTIONS, LOGGING_OPTIONS } from '../constants/logging.constants';
import { LoggingModuleLevel, LogType } from '../types';

@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger: pino.Logger;
  private readonly streamToElastic: any;

  constructor(
    @Inject(LEVEL_OPTIONS) private readonly level: LoggingModuleLevel,
    @Inject(LOGGING_OPTIONS) private readonly loggingOptions?: any,
  ) {
    const {
      server: { isProd },
      elasticConfig,
    } = this.loggingOptions;

    if (isProd) {
      if (elasticConfig && !_.isEmpty(elasticConfig)) {
        this.streamToElastic = pinoElasticSearch({
          index: 'api-',
          node: 'http://localhost:9200',
          'es-version': 7,
          ...elasticConfig,
        });
        this.logger = pino(
          {
            level: this.level,
          },
          pinoMultiStream([{ stream: process.stdout }, { stream: this.streamToElastic }]),
        );
      } else {
        this.logger = pino({ level: this.level });
      }
    } else {
      this.logger = pino({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
        level: this.level,
      });
    }
  }

  public readFile(pathSegment: string, filename: string) {
    const file = path.resolve(pathSegment, filename);
    return JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
  }

  public log(message: any) {
    const log = this.getGenericLog('info');
    log['message'] = message;
    this.logger.info(message);
  }

  public info(message: any, context?: any) {
    const log = this.getGenericLog('info');
    log['message'] = message;
    context ? this.logger.info({ context }, log) : this.logger.info(log);
  }

  public error(message: any, context?: any) {
    const log = this.getGenericLog('error');
    log['message'] = message;
    context ? this.logger.error({ context }, log) : this.logger.error(log);
  }

  public warn(message: any, context?: any) {
    const log = this.getGenericLog('warn');
    log['message'] = message;
    context ? this.logger.warn({ context }, log) : this.logger.warn(log);
  }

  public fatal(message: any, context?: any) {
    const log = this.getGenericLog('fatal');
    log['message'] = message;
    context ? this.logger.fatal({ context }, log) : this.logger.fatal(log);
  }

  public debug(message: any, context?: any) {
    const log = this.getGenericLog('debug');
    log['message'] = message;
    context ? this.logger.debug({ context }, log) : this.logger.debug(log);
  }

  public trace(message: any, context?: any) {
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
      application_name: process.env.npm_package_name,
      application_version: process.env.npm_package_version,
      logger_name: packageInfo.name,
      logger_version: packageInfo.version,
      '@timestamp': timestamp ? timestamp : Date.now(),
      log_level: loggingLevel.toUpperCase(),
      log_type: logType,
    };
  }

  public addRequestLogs(
    request: any,
    context: ExecutionContext,
    timeRequest: number,
    requestDuration: number,
  ) {
    const requestLog = this.getGenericLog('info', 'RESPONSE', timeRequest);
    requestLog['thread_name'] = '-';
    requestLog['message'] = 'Request executed';
    requestLog['http_request_execution_context_class'] = context.getClass().name;
    requestLog['http_request_execution_context_handler'] = context.getHandler().name;
    requestLog['http_request_execution_context_type'] = context.getType();
    requestLog['http_request_body'] = request.body;
    requestLog['http_request_body_stringify'] = JSON.stringify(request.body);
    requestLog['http_request_headers'] = request.headers;
    requestLog['http_request_headers_stringify'] = JSON.stringify(request.headers);
    requestLog['http_duration'] = Date.now() - requestDuration;
    LoggingService.addHttpInfo(request, requestLog);
    LoggingService.addTracingHeaders(request, requestLog);
    return requestLog;
  }

  public addResponseLogs(
    request: any,
    response: any,
    body: any,
    context: ExecutionContext,
    timeRequest: number,
    requestDuration: number,
  ) {
    const responseLog = this.getGenericLog('info', 'RESPONSE', timeRequest);
    responseLog['http_response_status_code'] = response.statusCode;
    responseLog['http_response_status_phrase'] = HttpStatus[response.statusCode];
    responseLog['http_response_body'] = body;
    responseLog['http_response_body_stringify'] = JSON.stringify(body);
    responseLog['http_response_headers'] = response.getHeaders();
    responseLog['http_response_headers_stringify'] = JSON.stringify(response.getHeaders());
    responseLog['http_duration'] = Date.now() - requestDuration;
    LoggingService.addHttpInfo(request, responseLog);
    LoggingService.addTracingHeaders(request, responseLog);
    return responseLog;
  }

  private static addHttpInfo(request: any, jsonLog: any) {
    jsonLog['http_request_address'] = `${request.protocol}://${request.get('host')}${request.path}`;
    jsonLog['http_request_query_string'] = request.query;
    jsonLog['http_request_method'] = request.method;
    jsonLog['http_request_path'] = request.path;
    jsonLog['http_request_remote_address'] = request.ip;
  }

  private static addTracingHeaders(request: any, jsonLog: any) {
    const tracingHeaderJaeger: string = request.headers['uber-trace-id'];
    const jaegerIds = tracingHeaderJaeger ? tracingHeaderJaeger.split(':', 3) : ['-', '-', '-'];
    jsonLog['trace_id'] = jaegerIds[0];
    jsonLog['span_id'] = jaegerIds[1];
    jsonLog['span_parent_id'] = jaegerIds[2];
  }
}
