import { Component } from '@angular/core';
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
  templateUrl: './add-new-project.component.html',
})
export class AddNewProjectComponent {
  form: FormGroup<AddNewProjectForm> = new FormGroup<AddNewProjectForm>({
    img: new FormControl<string | null>(''),
    name: new FormControl<string | null>('', [Validators.required]),
    networkId: new FormControl<string | null>('', [Validators.required]),
    defaultIdentityId: new FormControl<string | null>('', [Validators.required]),
  });

  networks$: Observable<Network[]> = this.networksRepository.networks$;
  identities$: Observable<Identity[]> = this.identitiesRepository.identities$;

  constructor(
    private readonly networksRepository: NetworksRepository,
    private readonly identitiesRepository: IdentitiesRepository,
    private readonly projectsRepository: ProjectsRepository,
    private readonly matSnackBar: MatSnackBar,
    private readonly dialogRef: DialogRef
  ) {}

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
