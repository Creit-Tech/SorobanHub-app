import { Test, TestingModule } from '@nestjs/testing';
import { AppMenuService } from './app-menu.service';

describe('AppMenuService', () => {
  let service: AppMenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppMenuService],
    }).compile();

    service = module.get<AppMenuService>(AppMenuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
