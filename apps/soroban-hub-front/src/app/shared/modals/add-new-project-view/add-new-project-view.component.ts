import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Project,
  ProjectsRepository,
  ProjectView,
  projectViewsEntitiesRef,
} from '../../../state/projects/projects.repository';
import { Observable } from 'rxjs';
import { upsertEntities } from '@ngneat/elf-entities';

@Component({
  selector: 'app-add-new-project-view',
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
    JsonPipe,
  ],
  templateUrl: './add-new-project-view.component.html',
})
export class AddNewProjectViewComponent {
  form: FormGroup<AddNewProjectViewForm> = new FormGroup<AddNewProjectViewForm>({
    projectId: new FormControl<string | null>(this.data.project._id, [Validators.required]),
    name: new FormControl<string | null>('', [Validators.required]),
  });

  projects$: Observable<Project[]> = this.projectsRepository.projects$;

  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly dialogRef: MatDialogRef<AddNewProjectViewComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { project: Project },
    private readonly matSnackBar: MatSnackBar
  ) {}

  confirm(): void {
    if (this.form.invalid) {
      return;
    }

    const _id = crypto.randomUUID();
    this.projectsRepository.store.update(
      upsertEntities(
        [
          {
            _id,
            projectId: this.form.value.projectId as string,
            name: this.form.value.name as string,
          } satisfies ProjectView,
        ],
        { ref: projectViewsEntitiesRef }
      )
    );

    this.matSnackBar.open(`Project view "${this.form.value.name}" created`, 'close', {
      duration: 5000,
    });

    this.dialogRef.close();
  }
}

export interface AddNewProjectViewForm {
  projectId: FormControl<Project['_id'] | null>;
  name: FormControl<string | null>;
}
