import { Test, TestingModule } from '@nestjs/testing';
import { DisSensorService } from './dis-sensor.service';

describe('DisSensorService', () => {
  let service: DisSensorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisSensorService],
    }).compile();

    service = module.get<DisSensorService>(DisSensorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
