import { Test, TestingModule } from '@nestjs/testing';
import { AgileController } from './agile.controller';

describe('AgileController', () => {
  let controller: AgileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgileController],
    }).compile();

    controller = module.get<AgileController>(AgileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
