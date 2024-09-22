import { createStore, select, withProps } from '@ngneat/elf';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LockScreenProps {
  isUnLocked: boolean;
  password?: string;
}

const store = createStore(
  { name: 'lockScreen' },
  withProps<LockScreenProps>({
    isUnLocked: false,
  })
);

@Injectable({ providedIn: 'root' })
export class LockScreenRepository {
  store = store;

  isUnLocked$: Observable<boolean> = this.store.pipe(select((state: LockScreenProps) => state.isUnLocked));
}
