import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

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
          this.loggingService.addRequestLogs(this.request, context, timeRequest, requestDuration);
          this.loggingService.addResponseLogs(
            this.request,
            this.response,
            response,
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
}
