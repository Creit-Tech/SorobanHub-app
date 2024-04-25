import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import {
  Project,
  ProjectsRepository,
  ProjectView,
  projectViewsEntitiesRef,
} from '../../../state/projects/projects.repository';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LedgerKeyExpirationWidget,
  Widget,
  WidgetsRepository,
  WidgetType,
} from '../../../state/widgets/widgets.repository';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom, Observable } from 'rxjs';
import { emitOnce } from '@ngneat/elf';
import { updateEntities, upsertEntities } from '@ngneat/elf-entities';
import { NetworkLedgerService } from '../../../core/services/network-ledger/network-ledger.service';

@Component({
  selector: 'app-add-new-widget',
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
  templateUrl: './add-new-widget.component.html',
  styles: ``,
})
export class AddNewWidgetComponent {
  protected readonly WidgetType = WidgetType;

  baseForm: FormGroup<BaseForm> = new FormGroup<BaseForm>({
    project: new FormControl<Project['_id'] | null>(this.data.projectView.projectId, [Validators.required]),
    projectView: new FormControl<ProjectView['_id'] | null>(this.data.projectView._id, [Validators.required]),
    name: new FormControl<string | null>('', [Validators.required]),
    type: new FormControl<WidgetType | null>(WidgetType.LEDGER_KEY_EXPIRATION, [Validators.required]),
  });

  ledgerKeyForm: FormGroup<LedgerKeyForm> = new FormGroup<LedgerKeyForm>({
    type: new FormControl<'CONTRACT_ID' | 'CONTRACT_HASH' | 'LEDGER_KEY' | null>('CONTRACT_ID', [Validators.required]),
    value: new FormControl<string | null>('', [Validators.required]),
  });

  projects$: Observable<Project[]> = this.projectsRepository.projects$;
  activeProjectViews$: Observable<ProjectView[]> = this.projectsRepository.activeProjectViews$;

  widgetTypes: WidgetType[] = Object.values(WidgetType);

  constructor(
    private readonly dialogRef: MatDialogRef<AddNewWidgetComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { projectView: ProjectView },
    private readonly matSnackBar: MatSnackBar,
    private readonly projectsRepository: ProjectsRepository,
    private readonly widgetsRepository: WidgetsRepository,
    private readonly networkLedgerService: NetworkLedgerService
  ) {}

  confirm(): void {
    if (this.baseForm.invalid || !this.ledgerKeyForm.value.type) {
      return;
    }

    let newWidget: Widget;
    switch (this.baseForm.value.type as WidgetType) {
      case WidgetType.LEDGER_KEY_EXPIRATION:
        if (this.ledgerKeyForm.invalid) {
          return;
        }
        newWidget = {
          _id: crypto.randomUUID(),
          project: this.baseForm.value.project as string,
          projectView: this.baseForm.value.projectView as string,
          name: this.baseForm.value.name as string,
          type: WidgetType.LEDGER_KEY_EXPIRATION,
          key: this.networkLedgerService.createLedgerKey({
            value: this.ledgerKeyForm.value.value as string,
            type: this.ledgerKeyForm.value.type,
          }),
        } satisfies LedgerKeyExpirationWidget;
        break;

      case WidgetType.LEDGER_KEY_WATCHER:
      case WidgetType.FUNCTION_CALL:
      case WidgetType.EVENTS_TRACKER:
      default:
        throw new Error(`Widget type "${this.baseForm.value.type}" is not supported.`);
    }

    emitOnce(() => {
      this.projectsRepository.store.update(
        updateEntities(
          [this.data.projectView._id],
          { widgets: [...this.data.projectView.widgets, newWidget._id] },
          { ref: projectViewsEntitiesRef }
        )
      );
      this.widgetsRepository.store.update(upsertEntities([newWidget]));
    });

    this.matSnackBar.open(`Widget "${newWidget.name}" saved`, 'close', {
      duration: 5000,
    });

    this.dialogRef.close();
  }
}

export interface BaseForm {
  project: FormControl<Project['_id'] | null>;
  projectView: FormControl<ProjectView['_id'] | null>;
  name: FormControl<string | null>;
  type: FormControl<WidgetType | null>;
}

export interface LedgerKeyForm {
  type: FormControl<'CONTRACT_ID' | 'CONTRACT_HASH' | 'LEDGER_KEY' | null>;
  value: FormControl<string | null>;
}
