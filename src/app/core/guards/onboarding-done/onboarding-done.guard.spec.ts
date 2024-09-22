import { TestBed } from '@angular/core/testing';
import { CanActivateChildFn } from '@angular/router';

import { onboardingDoneGuard } from './onboarding-done.guard';

describe('onboardingDoneGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => onboardingDoneGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
