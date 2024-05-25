import { Test, TestingModule } from '@nestjs/testing';
import { ChecksumsController } from './checksums.controller';

describe('ChecksumsController', () => {
  let controller: ChecksumsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChecksumsController],
    }).compile();

    controller = module.get<ChecksumsController>(ChecksumsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
