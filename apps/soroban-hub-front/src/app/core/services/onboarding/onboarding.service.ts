import { Injectable } from '@angular/core';
import { OnboardingRepository, SavingOnboarding } from '../../../state/onboarding/onboarding.repository';
import { setProp } from '@ngneat/elf';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  constructor(private readonly generalRepository: OnboardingRepository) {}

  @SavingOnboarding
  async saveOnboarding(params: SaveOnboardingParams): Promise<void> {
    await window.ipcAPI.invoke({
      route: 'settings/set-config',
      msg: params,
    });

    this.generalRepository.store.update(setProp('onboardingDone', true));
  }
}

export interface SaveOnboardingParams {
  password: string;
  databaseUrl: string;
}
