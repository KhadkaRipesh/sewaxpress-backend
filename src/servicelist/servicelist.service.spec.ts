import { Test, TestingModule } from '@nestjs/testing';
import { ServicelistService } from './servicelist.service';

describe('ServicelistService', () => {
  let service: ServicelistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicelistService],
    }).compile();

    service = module.get<ServicelistService>(ServicelistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
