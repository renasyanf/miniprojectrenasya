import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return root health payload', () => {
      expect(appController.getRootStatus()).toEqual({
        statusCode: 200,
        data: {
          status: 'ok',
          service: 'auth-api',
        },
      });
    });
  });
});
