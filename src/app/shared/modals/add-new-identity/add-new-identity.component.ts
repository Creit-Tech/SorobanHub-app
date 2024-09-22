import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { IdentitiesRepository, IdentityType } from '../../../state/identities/identities.repository';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { upsertEntities } from '@ngneat/elf-entities';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-add-new-identity',
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
          <input formControlName="name" matInput placeholder="Ex: Admin account" required />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Address</mat-label>
          <input formControlName="address" matInput placeholder="Ex: G... or C..." required />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Default source account</mat-label>
          <mat-select formControlName="type" required>
            @for (type of identityTypes; track type) {
              <mat-option [value]="type">{{ type }}</mat-option>
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
export class AddNewIdentityComponent {
  identitiesRepository: IdentitiesRepository = inject(IdentitiesRepository);
  matSnackBar: MatSnackBar = inject(MatSnackBar);
  dialogRef: DialogRef = inject(DialogRef);

  form: FormGroup<AddNewIdentityForm> = new FormGroup<AddNewIdentityForm>({
    name: new FormControl<string | null>('', [Validators.required]),
    address: new FormControl<string | null>('', [Validators.required]),
    type: new FormControl<IdentityType | null>(null, [Validators.required]),
  });

  identityTypes: IdentityType[] = Object.values(IdentityType);

  confirm() {
    if (this.form.invalid) {
      return;
    }

    const _id = crypto.randomUUID();
    this.identitiesRepository.store.update(
      upsertEntities({
        _id,
        name: this.form.value.name as string,
        address: this.form.value.address as string,
        type: this.form.value.type as IdentityType,
      })
    );

    this.matSnackBar.open(`Identity "${this.form.value.name}" saved`, 'close', {
      duration: 5000,
    });

    this.dialogRef.close();
  }
}

export interface AddNewIdentityForm {
  name: FormControl<string | null>;
  address: FormControl<string | null>;
  type: FormControl<IdentityType | null>;
}
