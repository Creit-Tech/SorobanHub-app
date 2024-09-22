import { Component, inject, Inject } from '@angular/core';
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
  template: `
    <h2 mat-dialog-title>Add a new project view</h2>

    <mat-dialog-content class="w-[20rem]">
      <section [formGroup]="form" class="flex w-full flex-col">
        <mat-form-field>
          <mat-label>Project</mat-label>
          <mat-select formControlName="projectId" required>
            @for (projects of projects$ | async; track projects._id) {
              <mat-option [value]="projects._id">{{ projects.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Name</mat-label>
          <input (keydown.enter)="confirm()" formControlName="name" matInput placeholder="Ex: Core Contract" required />
        </mat-form-field>

        <button (click)="confirm()" [disabled]="form.invalid" mat-raised-button color="primary" class="w-full">
          Confirm
        </button>
      </section>
    </mat-dialog-content>
  `,
  styles: ``,
})
export class AddNewProjectViewComponent {
  data: { project: Project } = inject(MAT_DIALOG_DATA);
  matSnackBar: MatSnackBar = inject(MatSnackBar);
  projectsRepository: ProjectsRepository = inject(ProjectsRepository);
  dialogRef: MatDialogRef<AddNewProjectViewComponent> = inject(MatDialogRef<AddNewProjectViewComponent>);

  form: FormGroup<AddNewProjectViewForm> = new FormGroup<AddNewProjectViewForm>({
    projectId: new FormControl<string | null>(this.data.project._id, [Validators.required]),
    name: new FormControl<string | null>('', [Validators.required]),
  });

  projects$: Observable<Project[]> = this.projectsRepository.projects$;

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
            widgets: [],
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
