import { Component, Inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project, ProjectsRepository } from '../../../state/projects/projects.repository';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';
import { Network, NetworksRepository } from '../../../state/networks/networks.repository';
import { IdentitiesRepository, Identity } from '../../../state/identities/identities.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { setActiveId, upsertEntities } from '@ngneat/elf-entities';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-edit-project',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButton,
    MatDialogContent,
    MatFormField,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    MatInput,
    MatDialogTitle,
    MatLabel,
  ],
  templateUrl: './edit-project.component.html',
  styles: ``,
})
export class EditProjectComponent {
  form: FormGroup<UpdateProjectForm> = new FormGroup<UpdateProjectForm>({
    img: new FormControl<string | null>(this.data.project.img || null),
    name: new FormControl<string | null>(this.data.project.name, [Validators.required]),
    networkId: new FormControl<string | null>(this.data.project.networkId, [Validators.required]),
    defaultIdentityId: new FormControl<string | null>(this.data.project.defaultIdentityId, [Validators.required]),
  });

  networks$: Observable<Network[]> = this.networksRepository.networks$;
  identities$: Observable<Identity[]> = this.identitiesRepository.identities$;

  constructor(
    @Inject(DIALOG_DATA)
    public readonly data: { project: Project },
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

    this.projectsRepository.store.update(
      upsertEntities([
        {
          _id: this.data.project._id,
          name: this.form.value.name as string,
          defaultIdentityId: this.form.value.defaultIdentityId as string,
          networkId: this.form.value.networkId as string,
          img: this.form.value.img ? this.form.value.img : undefined,
        } satisfies Project,
      ]),
      setActiveId(this.data.project._id)
    );

    this.matSnackBar.open(`Project "${this.form.value.name}" updated`, 'close', {
      duration: 5000,
    });

    this.dialogRef.close();
  }
}

export interface UpdateProjectForm {
  img: FormControl<string | null>;
  name: FormControl<string | null>;
  networkId: FormControl<string | null>;
  defaultIdentityId: FormControl<string | null>;
}
