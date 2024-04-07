import { TestBed } from '@angular/core/testing';

import { LockScreenService } from './lock-screen.service';

describe('LockScreenService', () => {
  let service: LockScreenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LockScreenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
