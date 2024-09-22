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
    this.generalRepository.store.update(setProp('onboardingDone', true));
  }
}

export interface SaveOnboardingParams {
  password: string;
}
