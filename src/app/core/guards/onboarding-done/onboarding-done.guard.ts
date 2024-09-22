import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { OnboardingProps, OnboardingRepository } from '../../../state/onboarding/onboarding.repository';
import { firstValueFrom } from 'rxjs';

export const onboardingDoneGuard = (onboardingTarget: boolean, path: string[]): CanActivateChildFn | CanActivateFn => {
  return async (): Promise<boolean> => {
    const onboardingRepository: OnboardingRepository = inject(OnboardingRepository);
    const router: Router = inject(Router);

    const initialized: boolean = await firstValueFrom(onboardingRepository.persist.initialized$);

    if (!initialized) {
      return false;
    }

    const storage: OnboardingProps = onboardingRepository.store.getValue();

    if (storage.onboardingDone !== onboardingTarget) {
      return router.navigate(path).then((): boolean => false);
    }

    return true;
  };
};
