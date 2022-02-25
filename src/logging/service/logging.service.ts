import { ExecutionContext, HttpStatus, Injectable, LoggerService } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import pino from 'pino';
const pinoElasticSearch = require('pino-elasticsearch');
import { ElasticSearchConfig, LoggingModuleLevel, LogType } from '../types';

@Injectable()
export class LoggingService implements LoggerService {
  private logger: pino.Logger;
  private readonly streamToElastic: any;
  private requestLog: any;
  private responseLog: any;

  constructor(isProd: boolean, level: LoggingModuleLevel, elasticConfig?: ElasticSearchConfig) {
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

  public readFile(pathSegment: string, filename: string) {
    const file = path.resolve(pathSegment, filename);
    return JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
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

  /**/

  public addRequestLogs(
    request: any,
    context: ExecutionContext,
    timeRequest: number,
    requestDuration: number,
  ): void {
    this.requestLog = this.getGenericLog('info', 'RESPONSE', timeRequest);
    this.requestLog['thread_name'] = '-';
    this.requestLog['message'] = 'Request executed';
    this.requestLog['http_request_execution_context_class'] = context.getClass().name;
    this.requestLog['http_request_execution_context_handler'] = context.getHandler().name;
    this.requestLog['http_request_execution_context_type'] = context.getType();
    this.requestLog['http_request_body'] = request.body;
    this.requestLog['http_request_body_stringify'] = JSON.stringify(request.body);
    this.requestLog['http_request_headers'] = request.headers;
    this.requestLog['http_request_headers_stringify'] = JSON.stringify(request.headers);
    this.requestLog['http_duration'] = Date.now() - requestDuration;

    LoggingService.addHttpInfo(request, this.requestLog);
    LoggingService.addTracingHeaders(request, this.requestLog);
  }

  public addResponseLogs(
    request: any,
    response: any,
    body: any,
    context: ExecutionContext,
    timeRequest: number,
    requestDuration: number,
  ): void {
    this.responseLog = this.getGenericLog('info', 'RESPONSE', timeRequest);
    this.responseLog['thread_name'] = '-';
    this.responseLog['message'] = 'Response generated';
    this.responseLog['http_response_execution_context_class'] = context.getClass().name;
    this.responseLog['http_response_execution_context_handler'] = context.getHandler().name;
    this.responseLog['http_response_execution_context_type'] = context.getType();
    this.responseLog['http_response_status_code'] = response.statusCode;
    this.responseLog['http_response_status_phrase'] = HttpStatus[response.statusCode];
    this.responseLog['http_response_body'] = body;
    this.responseLog['http_response_body_stringify'] = JSON.stringify(body);
    this.responseLog['http_response_headers'] = response.getHeaders();
    this.responseLog['http_response_headers_stringify'] = JSON.stringify(response.getHeaders());
    this.responseLog['http_duration'] = Date.now() - requestDuration;
    LoggingService.addHttpInfo(request, this.responseLog);
    LoggingService.addTracingHeaders(request, this.responseLog);
  }

  private static addHttpInfo(request: any, jsonLog: any) {
    jsonLog['http_request_address'] = request.protocol + '://' + request.get('host') + request.path;
    jsonLog['http_request_query_string'] = request.query;
    jsonLog['http_request_method'] = request.method;
    jsonLog['http_request_path'] = request.path;
    jsonLog['http_request_remote_address'] = request.ip;
  }

  private static addTracingHeaders(request: any, jsonLog: any) {
    if (request.headers && request.headers['uber-trace-id']) {
      const tracingHeaderJaeger: string = request.headers['uber-trace-id'];
      const jaegerIds = tracingHeaderJaeger ? tracingHeaderJaeger.split(':', 3) : ['-', '-', '-'];
      jsonLog['trace_id'] = jaegerIds[0];
      jsonLog['span_id'] = jaegerIds[1];
      jsonLog['span_parent_id'] = jaegerIds[2];
    }
  }
}
