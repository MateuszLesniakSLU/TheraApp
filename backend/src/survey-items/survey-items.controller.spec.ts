import { Test, TestingModule } from '@nestjs/testing';
import { SurveyItemsController } from './survey-items.controller';

describe('SurveyItemsController', () => {
  let controller: SurveyItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveyItemsController],
    }).compile();

    controller = module.get<SurveyItemsController>(SurveyItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
