import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingModule } from '../logging/logging.module';
import { ElasticSearchService } from '../logging/service/elastic-search.service';

const mockedConfigWithElastic = {
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
};

describe('ElasticSearchService', () => {
  let service: ElasticSearchService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jest.fn().mockImplementation(() => mockedConfigWithElastic)],
        }),
        LoggingModule.registerWithElastic(),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init;
    service = module.get<ElasticSearchService>(ElasticSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
