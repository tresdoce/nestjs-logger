import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';
import * as _ from 'lodash';

import { excludePaths } from '../constants/logging.constants';
import { LoggingService } from '../service/logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private request: any;
  private response: any;
  private requestLog: any;
  private responseLog: any;

  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeRequest = Date.now();
    const ctx = context.switchToHttp();
    this.request = ctx.getRequest();
    this.response = ctx.getResponse();

    return next.handle().pipe(
      tap((response) => {
        if (_.isUndefined(excludePaths.find((path) => _.startsWith(this.request.path, path)))) {
          const requestDuration = Date.now() - timeRequest;
          this.addRequestLogs(this.request, this.requestLog, context, timeRequest, requestDuration);
          this.addResponseLogs(
            this.request,
            this.response,
            response,
            this.responseLog,
            context,
            timeRequest,
            requestDuration,
          );
          this.loggingService.log(this.requestLog);
          this.loggingService.log(this.responseLog);
        }
      }),
    );
  }

  private addRequestLogs(
    request: any,
    requestLog: any,
    context: ExecutionContext,
    timeRequest: number,
    requestDuration: number,
  ): void {
    requestLog = this.loggingService.getGenericLog('info', 'REQUEST', timeRequest);
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
    this.addHttpInfo(request, requestLog);
    this.addTracingHeaders(request, requestLog);
  }

  private addResponseLogs(
    request: any,
    response: any,
    body: any,
    responseLog: any,
    context: ExecutionContext,
    timeRequest: number,
    requestDuration: number,
  ) {
    responseLog = this.loggingService.getGenericLog('info', 'RESPONSE', timeRequest);
    responseLog['thread_name'] = '-';
    responseLog['message'] = 'Response generated';
    responseLog['http_response_execution_context_class'] = context.getClass().name;
    responseLog['http_response_execution_context_handler'] = context.getHandler().name;
    responseLog['http_response_execution_context_type'] = context.getType();
    responseLog['http_response_status_code'] = response.statusCode;
    responseLog['http_response_status_phrase'] = HttpStatus[response.statusCode];
    responseLog['http_response_body'] = body;
    responseLog['http_response_body_stringify'] = JSON.stringify(body);
    responseLog['http_response_headers'] = response.getHeaders();
    responseLog['http_response_headers_stringify'] = JSON.stringify(response.getHeaders());
    responseLog['http_duration'] = Date.now() - requestDuration;
    this.addHttpInfo(request, responseLog);
    this.addTracingHeaders(request, responseLog);
  }

  private addHttpInfo(request: any, jsonLog: any) {
    jsonLog['http_request_address'] = request.protocol + '://' + request.get('host') + request.path;
    jsonLog['http_request_query_string'] = request.query;
    jsonLog['http_request_method'] = request.method;
    jsonLog['http_request_path'] = request.path;
    jsonLog['http_request_remote_address'] = request.ip;
  }

  private addTracingHeaders(request: any, jsonLog: any) {
    const tracingHeaderJaeger: string = request.headers['uber-trace-id'];
    const jaegerIds = tracingHeaderJaeger ? tracingHeaderJaeger.split(':', 3) : ['-', '-', '-'];
    jsonLog['trace_id'] = jaegerIds[0];
    jsonLog['span_id'] = jaegerIds[1];
    jsonLog['span_parent_id'] = jaegerIds[2];
  }
}
