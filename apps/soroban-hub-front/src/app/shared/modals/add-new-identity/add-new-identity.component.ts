import { Component } from '@angular/core';
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
  templateUrl: './add-new-identity.component.html',
})
export class AddNewIdentityComponent {
  form: FormGroup<AddNewIdentityForm> = new FormGroup<AddNewIdentityForm>({
    name: new FormControl<string | null>('', [Validators.required]),
    address: new FormControl<string | null>('', [Validators.required]),
    type: new FormControl<IdentityType | null>(null, [Validators.required]),
  });

  identityTypes: IdentityType[] = Object.values(IdentityType);

  constructor(
    private readonly identitiesRepository: IdentitiesRepository,
    private readonly matSnackBar: MatSnackBar,
    private readonly dialogRef: DialogRef
  ) {}

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
