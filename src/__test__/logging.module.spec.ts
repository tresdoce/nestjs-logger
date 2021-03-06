import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingModule } from '../logging/logging.module';
const mockedConfig = {
  config: {
    server: {
      isProd: false,
    },
  },
};

describe('LoggingModule', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jest.fn().mockImplementation(() => mockedConfig)],
        }),
        LoggingModule.register(),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  });
});

/*const mockedConfigWithElastic = {
  config: {
    server: {
      isProd: true,
    },
    elasticConfig: {
      index: 'test',
      node: 'http://localhost:9200',
      Connection: jest.fn().mockReturnThis(),
      auth: {
        username: '',
        password: '',
      },
    },
  },
};*/
