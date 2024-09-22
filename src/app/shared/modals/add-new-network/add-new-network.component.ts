import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Networks } from '@stellar/stellar-sdk';
import { NetworksRepository } from '../../../state/networks/networks.repository';
import { upsertEntities } from '@ngneat/elf-entities';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-add-new-network',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatButton,
    MatDialogContent,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
  ],
  template: `
    <h2 mat-dialog-title>Add a new Identity</h2>

    <mat-dialog-content class="w-[20rem]">
      <section [formGroup]="form" class="flex w-full flex-col">
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input formControlName="name" matInput placeholder="Ex: Private network" required />
        </mat-form-field>

        <mat-form-field>
          <mat-label>RPC URL</mat-label>
          <input formControlName="rpcUrl" matInput placeholder="Ex: https://testnet.rpc.com" required />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Network</mat-label>
          <mat-select formControlName="networkPassphrase" required>
            @for (network of networks; track network) {
              <mat-option [value]="network">{{ network }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <button (click)="confirm()" [disabled]="form.invalid" mat-raised-button color="primary" class="w-full">
          Confirm
        </button>
      </section>
    </mat-dialog-content>
  `,
  styles: ``,
})
export class AddNewNetworkComponent {
  networksRepository: NetworksRepository = inject(NetworksRepository);
  matSnackBar: MatSnackBar = inject(MatSnackBar);
  dialogRef: DialogRef = inject(DialogRef);

  form: FormGroup<AddNewNetworkForm> = new FormGroup<AddNewNetworkForm>({
    name: new FormControl<string | null>('', [Validators.required]),
    rpcUrl: new FormControl<string | null>('', [Validators.required]),
    networkPassphrase: new FormControl<Networks | null>(null, [Validators.required]),
  });

  networks: Networks[] = Object.values(Networks);

  confirm() {
    if (this.form.invalid) {
      return;
    }

    const _id = crypto.randomUUID();
    this.networksRepository.store.update(
      upsertEntities({
        _id,
        name: this.form.value.name as string,
        rpcUrl: this.form.value.rpcUrl as string,
        networkPassphrase: this.form.value.networkPassphrase as Networks,
      })
    );

    this.matSnackBar.open(`Network "${this.form.value.name}" saved`, 'close', {
      duration: 5000,
    });

    this.dialogRef.close();
  }
}

export interface AddNewNetworkForm {
  name: FormControl<string | null>;
  rpcUrl: FormControl<string | null>;
  networkPassphrase: FormControl<Networks | null>;
}
