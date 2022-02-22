import { LoggingService } from '../logging/service/logging.service';
import { LoggingInterceptor } from '../logging/interceptor/logging.interceptor';

const testInterceptorRequest: any = {
  logger_name: 'INFO',
  '@timestamp': Date.now(),
  log_level: 'REQUEST',
  build_version: process.env.npm_package_version,
  build_parent_version: 'v2.0',
  log_type: 'DEFAULT',
};

const testInterceptorResponse: any = {
  logger_name: 'INFO',
  '@timestamp': Date.now(),
  log_level: 'REQUEST',
  build_version: process.env.npm_package_version,
  build_parent_version: 'v2.0',
  log_type: 'DEFAULT',
};

const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
};

const callHandler: any = {
  handle: jest.fn(() => ({
    pipe: jest.fn(() => ({
      tap: jest.fn(),
    })),
  })),
};

let loggerService: LoggingService;
const interceptor: LoggingInterceptor = new LoggingInterceptor(loggerService);

describe('LoggingInterceptor', () => {
  it('should return an LoggingInterceptor toBeDefined', () => {
    expect(new LoggingInterceptor(loggerService)).toBeDefined();
  });

  it('should return an LoggingInterceptor instance', () => {
    const actualValue = interceptor.intercept(executionContext, callHandler);
    // console.log(actualValue);
    //expect(actualValue).toBe(mockgetGenericLogRequest);
    expect(callHandler.handle).toBeCalledTimes(1);
  });
});
