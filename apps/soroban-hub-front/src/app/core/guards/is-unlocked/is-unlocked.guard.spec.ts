import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isUnlockedGuard } from './is-unlocked.guard';

describe('isUnlockedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isUnlockedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
