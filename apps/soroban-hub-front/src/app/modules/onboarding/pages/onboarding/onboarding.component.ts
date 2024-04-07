import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OnboardingService } from '../../../../core/services/onboarding/onboarding.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Networks } from '@stellar/stellar-sdk';
import { IdentitiesRepository, IdentityType } from '../../../../state/identities/identities.repository';
import { NetworksRepository } from '../../../../state/networks/networks.repository';
import { setEntities } from '@ngneat/elf-entities';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styles: [
    `
      :host {
        @apply block flex min-h-screen;
      }
    `,
  ],
})
export class OnboardingComponent {
  networks: Array<{ key: string; value: Networks }> = Object.entries(Networks).map(([key, value]) => ({
    key,
    value,
  }));

  passwordControl: FormControl<string | null> = new FormControl<string | null>('', [
    Validators.required,
    Validators.minLength(12),
  ]);
  mongodbURIControl: FormControl<string | null> = new FormControl<string | null>('', [Validators.required]);

  networkGroupControl: FormGroup<INetworkFormGroup> = new FormGroup<INetworkFormGroup>({
    name: new FormControl<string | null>('', [Validators.required]),
    rpcUrl: new FormControl<string | null>('', [Validators.required]),
    network: new FormControl<string | null>('', [Validators.required]),
  });

  identityGroupControl: FormGroup<IIdentityFormGroup> = new FormGroup<IIdentityFormGroup>({
    name: new FormControl<string | null>('', [Validators.required]),
    publicKey: new FormControl<string | null>('', [Validators.required]),
  });

  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly matSnackBar: MatSnackBar,
    private readonly router: Router,
    private readonly identitiesRepository: IdentitiesRepository,
    private readonly networksRepository: NetworksRepository
  ) {}

  async confirm(): Promise<void> {
    if (
      this.passwordControl.invalid ||
      this.mongodbURIControl.invalid ||
      this.identityGroupControl.invalid ||
      this.networkGroupControl.invalid
    ) {
      // TODO: Toast error
      return;
    }

    await this.onboardingService.saveOnboarding({
      databaseUrl: this.mongodbURIControl.value as string,
      password: this.passwordControl.value as string,
    });

    this.identitiesRepository.store.update(
      setEntities([
        {
          _id: crypto.randomUUID(),
          type: IdentityType.ACCOUNT,
          name: this.identityGroupControl.value.name as string,
          address: this.identityGroupControl.value.publicKey as string,
        },
      ])
    );

    this.networksRepository.store.update(
      setEntities([
        {
          _id: crypto.randomUUID(),
          name: this.networkGroupControl.value.name as string,
          rpcUrl: this.networkGroupControl.value.rpcUrl as string,
          networkPassphrase: this.networkGroupControl.value.network as Networks,
        },
      ])
    );

    this.matSnackBar.open('Settings have been saved', 'OK', { duration: 5000 });
    await this.router.navigate(['/']);
  }
}

export interface INetworkFormGroup {
  name: FormControl<string | null>;
  rpcUrl: FormControl<string | null>;
  network: FormControl<string | null>;
}

export interface IIdentityFormGroup {
  name: FormControl<string | null>;
  publicKey: FormControl<string | null>;
}
