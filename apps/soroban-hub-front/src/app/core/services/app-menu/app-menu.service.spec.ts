import { TestBed } from '@angular/core/testing';

import { AppMenuService } from './app-menu.service';

describe('AppMenuService', () => {
  let service: AppMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
