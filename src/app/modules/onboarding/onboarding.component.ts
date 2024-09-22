import { Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Networks } from '@stellar/stellar-sdk';
import { OnboardingService } from '../../core/services/onboarding/onboarding.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IdentitiesRepository, Identity, IdentityType } from '../../state/identities/identities.repository';
import { Network, NetworksRepository } from '../../state/networks/networks.repository';
import { LockScreenService } from '../../core/services/lock-screen/lock-screen.service';
import { setEntities } from '@ngneat/elf-entities';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatStepper,
    MatStep,
    MatFormField,
    ReactiveFormsModule,
    MatInput,
    MatIconButton,
    MatStepperNext,
    MatStepLabel,
    MatStepperPrevious,
    MatOption,
    MatSelect,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatLabel,
    MatHint,
    MatCard,
    MatCardContent,
  ],
  template: `
    <section class="flex min-h-screen w-auto max-w-[23rem] items-center p-[1rem]">
      <mat-stepper class="h-full w-full rounded-[0.5rem]" orientation="vertical" [linear]="true" #stepper>
        <mat-step [stepControl]="passwordControl">
          <div class="w-full pt-[1rem]">
            <ng-template matStepLabel>Create a password</ng-template>
            <mat-form-field>
              <mat-label>Password</mat-label>
              <input
                (keydown.enter)="confirm()"
                placeholder="Write here"
                required
                [type]="hide ? 'password' : 'text'"
                [formControl]="passwordControl"
                matInput />
              <button mat-icon-button matSuffix (click)="hide = !hide">
                <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint>Min 12 characters</mat-hint>
            </mat-form-field>

            <div class="h-[1rem] w-full"></div>

            <div>
              <button mat-raised-button color="primary" [disabled]="passwordControl.invalid" matStepperNext>
                Next
              </button>
            </div>
          </div>
        </mat-step>

        <mat-step [stepControl]="networkGroupControl">
          <div [formGroup]="networkGroupControl" class="w-full pt-[1rem]">
            <ng-template matStepLabel>Create a network</ng-template>
            <mat-form-field>
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" placeholder="Ex: Private Network" required />
            </mat-form-field>

            <mat-form-field>
              <mat-label>RPC URL</mat-label>
              <input matInput formControlName="rpcUrl" placeholder="Ex: https://rpc.com" required />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Network Passphrase</mat-label>
              <mat-select formControlName="network">
                @for (network of networks; track network.key) {
                  <mat-option [value]="network.value">{{ network.key }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <div>
              <button mat-button matStepperPrevious>Back</button>
              <button
                mat-button
                [disabled]="networkGroupControl.invalid"
                mat-raised-button
                color="primary"
                matStepperNext>
                Next
              </button>
            </div>
          </div>
        </mat-step>

        <mat-step [stepControl]="identityGroupControl">
          <div [formGroup]="identityGroupControl" class="w-full pt-[1rem]">
            <ng-template matStepLabel>Create an identity</ng-template>
            <mat-form-field>
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" placeholder="Ex: Protocol admin" required />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Public Key</mat-label>
              <input matInput formControlName="publicKey" placeholder="G...." required />
            </mat-form-field>

            <div>
              <button mat-button matStepperPrevious>Back</button>
              <button
                mat-button
                [disabled]="identityGroupControl.invalid"
                mat-raised-button
                color="primary"
                matStepperNext>
                Next
              </button>
            </div>
          </div>
        </mat-step>

        <mat-step>
          <ng-template matStepLabel>Done</ng-template>

          <p class="mb-[0.5rem] pt-[1rem] text-center">You're all set!</p>

          <div>
            <button (click)="confirm()" class="mb-[0.5rem] w-full" mat-raised-button color="primary">Confirm</button>
            <button class="w-full" mat-raised-button color="danger" (click)="stepper.reset()">Reset</button>
          </div>
        </mat-step>
      </mat-stepper>
    </section>

    <section class="min-h-screen w-full p-[1rem]">
      <div class="flex h-full w-full flex-col items-center justify-center">
        <div class="w-full">
          @switch (stepper.selectedIndex) {
            @case (0) {
              <img class="mx-auto w-[10rem]" src="/images/undraw/security.svg" alt="security" />
            }
            @case (1) {
              <img class="mx-auto w-[10rem]" src="/images/undraw/maintenance.svg" alt="maintenance_server" />
            }
            @case (2) {
              <img class="mx-auto w-[10rem]" src="/images/undraw/cluster.svg" alt="maintenance_server" />
            }
            @case (3) {
              <img class="mx-auto w-[10rem]" src="/images/undraw/mention.svg" alt="maintenance_server" />
            }
          }
        </div>

        <div class="w-full">
          @switch (stepper.selectedIndex) {
            @case (0) {
              <mat-card class="mx-auto max-w-[20rem] rounded-[0.5rem]">
                <mat-card-header>
                  <mat-card-subtitle>Password</mat-card-subtitle>
                  <mat-card-title>Protect your information</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>
                    All of the sensitive information in the app is encrypted with your password. You should use a really
                    strong password to protect your data.
                  </p>
                </mat-card-content>
              </mat-card>
            }

            @case (1) {
              <mat-card class="mx-auto max-w-[20rem] rounded-[0.5rem]">
                <mat-card-header>
                  <mat-card-subtitle>Database</mat-card-subtitle>
                  <mat-card-title>Your Mongodb connection</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>
                    SorobanHub saves most of its data on a Mongodb database, this one can be a local database or a cloud
                    database. The app will use the URI to connect with the database and will keep the URI in a config
                    file on your device.
                  </p>
                </mat-card-content>
              </mat-card>
            }

            @case (2) {
              <mat-card class="mx-auto max-w-[20rem] rounded-[0.5rem]">
                <mat-card-header>
                  <mat-card-subtitle>Network</mat-card-subtitle>
                  <mat-card-title>A network to use</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>
                    In SorobanHub you can manage multiple contracts across different networks, define the one you would
                    like to start using with your first project. You can add more networks later.
                  </p>
                </mat-card-content>
              </mat-card>
            }

            @case (3) {
              <mat-card class="mx-auto max-w-[20rem] rounded-[0.5rem]">
                <mat-card-header>
                  <mat-card-subtitle>Identity</mat-card-subtitle>
                  <mat-card-title>An Address to use</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>
                    With SorobanHub you can define and use multiple addresses at the same time. You can add more address
                    later and they can be both Stellar accounts or Soroban contracts. Be aware that SorobanHub does not
                    sign transactions, instead you can connect your wallet or take the transaction and manually sign it
                    elsewhere.
                  </p>
                </mat-card-content>
              </mat-card>
            }

            @case (4) {
              <mat-card class="mx-auto max-w-[20rem] rounded-[0.5rem]">
                <img class="mx-auto w-[10rem]" src="/logo/logo.png" alt="soroban-hub-logo" />

                <mat-card-header>
                  <mat-card-subtitle>Are you ready?</mat-card-subtitle>
                  <mat-card-title>Confirm and Continue</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Click confirm and your initial configuration will be saved in the folder your selected.</p>
                </mat-card-content>
              </mat-card>
            }
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        @apply block flex min-h-screen;
      }
    `,
  ],
})
export class OnboardingComponent {
  hide = true;

  networks: { key: string; value: Networks }[] = Object.entries(Networks).map(([key, value]) => ({
    key,
    value,
  }));

  passwordControl: FormControl<string | null> = new FormControl<string | null>('', [
    Validators.required,
    Validators.minLength(12),
  ]);

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
    private readonly networksRepository: NetworksRepository,
    private readonly lockScreenService: LockScreenService
  ) {}

  async confirm(): Promise<void> {
    if (this.passwordControl.invalid || this.identityGroupControl.invalid || this.networkGroupControl.invalid) {
      // TODO: Toast error
      return;
    }

    await this.onboardingService.saveOnboarding({
      password: this.passwordControl.value as string,
    });

    await this.lockScreenService.unlock(this.passwordControl.value as string);

    this.identitiesRepository.store.update(
      setEntities([
        {
          _id: crypto.randomUUID(),
          type: IdentityType.ACCOUNT,
          name: this.identityGroupControl.value.name as string,
          address: this.identityGroupControl.value.publicKey as string,
        } satisfies Identity,
      ])
    );

    this.networksRepository.store.update(
      setEntities([
        {
          _id: crypto.randomUUID(),
          name: this.networkGroupControl.value.name as string,
          rpcUrl: this.networkGroupControl.value.rpcUrl as string,
          networkPassphrase: this.networkGroupControl.value.network as Networks,
        } satisfies Network,
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
