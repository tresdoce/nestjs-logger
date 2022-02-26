import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { LOGGING_SERVICE } from '../logging/constants/logging.constants';
import { LoggingModule } from '../logging/logging.module';
import { LoggingService } from '../logging/service/logging.service';
import { LoggingInterceptor } from '../logging/interceptor/logging.interceptor';

const mockedDevConfig = {
  config: {
    server: {
      isProd: false,
    },
  },
};

const mockedManifest = {
  name: 'nestjs-logging',
  version: '1.0.0',
};

const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
};

describe('LoggingService development', () => {
  let loggingService: LoggingService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jest.fn().mockImplementation(() => mockedDevConfig)],
        }),
        LoggingModule.register('trace'),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    loggingService = module.get<LoggingService>(LOGGING_SERVICE);
  });

  it('should be read package file', () => {
    const packageFile = loggingService.readFile(__dirname, '../../package.json');
    expect(packageFile).toBeDefined();
    expect(packageFile).toEqual(expect.any(Object));
  });

  it('should be defined', () => {
    expect(loggingService).toBeInstanceOf(LoggingService);
  });

  it('Should return a GenericLog object', () => {
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    expect(loggingService.getGenericLog('info')).toHaveProperty('log_level');
  });

  it('Should return a GenericLog object with timestamp', () => {
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    expect(loggingService.getGenericLog('info', 'DEFAULT', 25451233144)).toHaveProperty(
      'log_level',
    );
  });

  it('Should log a simply info level message', () => {
    const spy = jest.spyOn(loggingService, 'log');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.log('Log a simply info level message');
    expect(spy).toBeCalledWith('Log a simply info level message');
  });

  it('Should log info level message', () => {
    const spy = jest.spyOn(loggingService, 'info');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.info('Log info level message');
    expect(spy).toBeCalledWith('Log info level message');
  });

  it('Should log info level message with context', () => {
    const spy = jest.spyOn(loggingService, 'info');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.info('Log info level message', 'Context log info level');
    expect(spy).toBeCalledWith('Log info level message', 'Context log info level');
  });

  it('Should log error level message', () => {
    const spy = jest.spyOn(loggingService, 'error');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.error('Log error level message');
    expect(spy).toBeCalledWith('Log error level message');
  });

  it('Should log error level message with context', () => {
    const spy = jest.spyOn(loggingService, 'error');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.error('Log error level message', 'Context log error level');
    expect(spy).toBeCalledWith('Log error level message', 'Context log error level');
  });

  it('Should log warn level message', () => {
    const spy = jest.spyOn(loggingService, 'warn');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.warn('Log warn level message');
    expect(spy).toBeCalledWith('Log warn level message');
  });

  it('Should log warn level message with context', () => {
    const spy = jest.spyOn(loggingService, 'warn');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.warn('Log warn level message', 'Context log warn level');
    expect(spy).toBeCalledWith('Log warn level message', 'Context log warn level');
  });

  it('Should log fatal level message', () => {
    const spy = jest.spyOn(loggingService, 'fatal');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.fatal('Log fatal level message');
    expect(spy).toBeCalledWith('Log fatal level message');
  });

  it('Should log fatal level message with context', () => {
    const spy = jest.spyOn(loggingService, 'fatal');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.fatal('Log fatal level message', 'Context log fatal level');
    expect(spy).toBeCalledWith('Log fatal level message', 'Context log fatal level');
  });

  it('Should log debug level message', () => {
    const spy = jest.spyOn(loggingService, 'debug');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.debug('Log debug level message');
    expect(spy).toBeCalledWith('Log debug level message');
  });

  it('Should log debug level message with context', () => {
    const spy = jest.spyOn(loggingService, 'debug');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.debug('Log debug level message', 'Context log debug level');
    expect(spy).toBeCalledWith('Log debug level message', 'Context log debug level');
  });

  it('Should log trace level message', () => {
    const spy = jest.spyOn(loggingService, 'trace');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.trace('Log trace level message');
    expect(spy).toBeCalledWith('Log trace level message');
  });

  it('Should log trace level message with context', () => {
    const spy = jest.spyOn(loggingService, 'trace');
    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    loggingService.trace('Log trace level message', 'Context log trace level');
    expect(spy).toBeCalledWith('Log trace level message', 'Context log trace level');
  });
});

const mockedProdConfig = {
  config: {
    server: {
      isProd: true,
    },
  },
};

describe('LoggingService prod', () => {
  let loggingService: LoggingService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jest.fn().mockImplementation(() => mockedProdConfig)],
        }),
        LoggingModule.register(),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    loggingService = module.get<LoggingService>(LOGGING_SERVICE);
  });

  it('should be defined', () => {
    expect(loggingService).toBeInstanceOf(LoggingService);
  });
});

const mockedProdConfigWithElastic = {
  config: {
    server: {
      isProd: true,
    },
    elasticConfig: {
      index: 'nestjs-test-module',
      node: 'http://localhost:9200',
      Connection: jest.fn().mockReturnThis(),
      auth: {
        username: '',
        password: '',
      },
    },
  },
};

describe('LoggingService prod with elastic config', () => {
  let loggingService: LoggingService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jest.fn().mockImplementation(() => mockedProdConfigWithElastic)],
        }),
        LoggingModule.register(),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    app.useGlobalInterceptors(new LoggingInterceptor(app.get<LoggingService>(LOGGING_SERVICE)));
    loggingService = module.get<LoggingService>(LOGGING_SERVICE);
  });

  it('should be defined', () => {
    expect(loggingService).toBeInstanceOf(LoggingService);
  });
});
