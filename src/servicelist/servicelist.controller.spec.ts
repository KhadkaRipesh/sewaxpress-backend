import { Test, TestingModule } from '@nestjs/testing';
import { ServicelistController } from './servicelist.controller';

describe('ServicelistController', () => {
  let controller: ServicelistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicelistController],
    }).compile();

    controller = module.get<ServicelistController>(ServicelistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
