import { createStore, select, withProps } from '@ngneat/elf';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import { StateToggleDecoratorFactory } from '../state-toggle.decorator';

export interface OnboardingProps {
  savingOnboarding: boolean;
  onboardingDone: boolean;
}

const store = createStore(
  { name: 'onboarding' },
  withProps<OnboardingProps>({
    savingOnboarding: false,
    onboardingDone: false,
  })
);

const persist = persistState(store, {
  key: '@SorobanHub/onboarding',
  storage: localStorageStrategy,
  source: state =>
    state.pipe(
      map((props: OnboardingProps) => {
        props.savingOnboarding = false;
        return props;
      })
    ),
});

@Injectable({ providedIn: 'root' })
export class OnboardingRepository {
  public store = store;
  public persist = persist;

  onboardingDone$: Observable<boolean> = this.store.pipe(select((state: OnboardingProps) => state.onboardingDone));
}

export const SavingOnboarding = StateToggleDecoratorFactory<OnboardingProps>(store, 'savingOnboarding');
