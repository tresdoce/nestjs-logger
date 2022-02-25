import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';

import { LoggingService } from '../logging/service/logging.service';
import { LoggingInterceptor } from '../logging/interceptor/logging.interceptor';
import { LOGGING_SERVICE } from '../logging/constants/logging.constants';
import { LoggingModule } from '../logging/logging.module';
import { AppModule } from './test-app/app.module';

/*const testInterceptorRequest: any = {
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

describe('LoggingInterceptor', () => {
  let loggerService: LoggingService;
  const interceptor: LoggingInterceptor = new LoggingInterceptor(loggerService);

  it('should return an LoggingInterceptor toBeDefined', () => {
    expect(new LoggingInterceptor(loggerService)).toBeDefined();
  });

  it('should return an LoggingInterceptor instance', () => {
    const actualValue = interceptor.intercept(executionContext, callHandler);
    console.log(actualValue);
    //expect(actualValue).toBe(mockgetGenericLogRequest);
    expect(callHandler.handle).toBeCalledTimes(1);
  });
});*/

const mockedProdConfig = {
  config: {
    server: {
      isProd: true,
    },
  },
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

describe('LoggingInterceptor', () => {
  let app: INestApplication;
  let loggingService: LoggingService;
  let interceptor: LoggingInterceptor = new LoggingInterceptor(loggingService);

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jest.fn().mockImplementation(() => mockedProdConfig)],
        }),
        LoggingModule.register(),
        AppModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    app.useGlobalInterceptors(interceptor);

    loggingService = moduleRef.get<LoggingService>(LOGGING_SERVICE);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an LoggingInterceptor toBeDefined', () => {
    expect(interceptor).toBeDefined();
  });

  it('Should be intercept and pass headers', async () => {
    await interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toBeCalledTimes(1);
  });

  it('should be return info in interceptor', async () => {
    /* const logSpy: jest.SpyInstance = jest.spyOn(loggingService, 'log');
    const responseInterceptor = await interceptor.intercept(executionContext, callHandler);
    const url: string = `/test-app/ok`;

    const responseReq = await request(app.getHttpServer()).get(url);
    expect(responseReq.status).toEqual(HttpStatus.OK);

    loggingService.log('test log');
    expect(logSpy).toBeCalledTimes(1);*/
    //const responseInterceptor = await interceptor.intercept(executionContext, callHandler);
    const url: string = `/test-app/ok`;

    const responseReq = await request(app.getHttpServer()).get(url);
    expect(responseReq.status).toEqual(HttpStatus.OK);
    //console.log(responseInterceptor)
  });

  it('bad request', async () => {
    const url: string = `/test-app/badRequest`;

    const responseReq = await request(app.getHttpServer()).get(url);
    expect(responseReq.status).toEqual(HttpStatus.BAD_REQUEST);
  });
});
