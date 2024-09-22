import { Component, inject } from '@angular/core';
import { MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Network, NetworksRepository } from '../../../state/networks/networks.repository';
import { IdentitiesRepository, Identity } from '../../../state/identities/identities.repository';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project, ProjectsRepository } from '../../../state/projects/projects.repository';
import { setActiveId, upsertEntities } from '@ngneat/elf-entities';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-add-new-project',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    AsyncPipe,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Add a new project</h2>

    <mat-dialog-content class="w-[20rem]">
      <section [formGroup]="form" class="flex w-full flex-col">
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input formControlName="name" matInput placeholder="Ex: SorobanDomains" required />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Network to use</mat-label>
          <mat-select formControlName="networkId" required>
            @for (network of networks$ | async; track network._id) {
              <mat-option [value]="network._id">{{ network.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Default source account</mat-label>
          <mat-select formControlName="defaultIdentityId" required>
            @for (identity of identities$ | async; track identity._id) {
              <mat-option [value]="identity._id">{{ identity.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Project image</mat-label>
          <input formControlName="img" matInput />
        </mat-form-field>

        <button (click)="confirm()" [disabled]="form.invalid" mat-raised-button color="primary" class="w-full">
          Confirm
        </button>
      </section>
    </mat-dialog-content>
  `,
  styles: ``,
})
export class AddNewProjectComponent {
  networksRepository: NetworksRepository = inject(NetworksRepository);
  identitiesRepository: IdentitiesRepository = inject(IdentitiesRepository);
  projectsRepository: ProjectsRepository = inject(ProjectsRepository);
  matSnackBar: MatSnackBar = inject(MatSnackBar);
  dialogRef: DialogRef = inject(DialogRef);

  form: FormGroup<AddNewProjectForm> = new FormGroup<AddNewProjectForm>({
    img: new FormControl<string | null>(''),
    name: new FormControl<string | null>('', [Validators.required]),
    networkId: new FormControl<string | null>('', [Validators.required]),
    defaultIdentityId: new FormControl<string | null>('', [Validators.required]),
  });

  networks$: Observable<Network[]> = this.networksRepository.networks$;
  identities$: Observable<Identity[]> = this.identitiesRepository.identities$;

  confirm() {
    if (this.form.invalid) {
      return;
    }

    const _id = crypto.randomUUID();
    this.projectsRepository.store.update(
      upsertEntities([
        {
          _id,
          name: this.form.value.name as string,
          defaultIdentityId: this.form.value.defaultIdentityId as string,
          networkId: this.form.value.networkId as string,
          img: this.form.value.img ? this.form.value.img : undefined,
        } satisfies Project,
      ]),
      setActiveId(_id)
    );

    this.matSnackBar.open(`Project "${this.form.value.name}" saved`, 'close', {
      duration: 5000,
    });

    this.dialogRef.close();
  }
}

export interface AddNewProjectForm {
  img: FormControl<string | null>;
  name: FormControl<string | null>;
  networkId: FormControl<string | null>;
  defaultIdentityId: FormControl<string | null>;
}
