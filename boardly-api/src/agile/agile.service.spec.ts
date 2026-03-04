import { Test, TestingModule } from '@nestjs/testing';
import { AgileService } from './agile.service';

describe('AgileService', () => {
  let service: AgileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgileService],
    }).compile();

    service = module.get<AgileService>(AgileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
