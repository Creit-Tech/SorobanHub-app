import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LockScreenRepository } from '../../../state/lock-screen/lock-screen.repository';

export const isUnlockedGuard: CanActivateFn = (): boolean => {
  const { store }: LockScreenRepository = inject(LockScreenRepository);
  const router: Router = inject(Router);

  if (store.getValue().isUnLocked) {
    return true;
  } else {
    router.navigate(['/lock-screen']).then();
    return false;
  }
};
