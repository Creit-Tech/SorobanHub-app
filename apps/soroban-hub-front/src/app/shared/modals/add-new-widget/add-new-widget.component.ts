import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import {
  Project,
  ProjectsRepository,
  ProjectView,
  projectViewsEntitiesRef,
} from '../../../state/projects/projects.repository';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DeployContractWidget,
  DeploySACWidget,
  FunctionCallParameterType,
  FunctionCallWidget,
  InstallWASMWidget,
  LedgerKeyExpirationWidget,
  Widget,
  WidgetsRepository,
  WidgetType,
} from '../../../state/widgets/widgets.repository';
import { AsyncPipe, JsonPipe, NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom, Observable } from 'rxjs';
import { emitOnce } from '@ngneat/elf';
import { updateEntities, upsertEntities } from '@ngneat/elf-entities';
import { NetworkLedgerService } from '../../../core/services/network-ledger/network-ledger.service';
import { NativeDialogsService } from '../../../core/services/native-dialogs/native-dialogs.service';

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
    NgTemplateOutlet,
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

  functionCallForm: FormGroup<FunctionCallForm> = new FormGroup<FunctionCallForm>({
    source: new FormControl<string | null>(null),
    fnName: new FormControl<string | null>(null, [Validators.required]),
    contractId: new FormControl<string | null>(null, [Validators.required]),
    parameters: new FormArray<FormGroup<FunctionCallParameter>>([]),
  });

  installOrDeployForm: FormGroup<InstallOrDeployWasmForm> = new FormGroup<InstallOrDeployWasmForm>({
    source: new FormControl<string | null>(null),
    pathToFile: new FormControl<string | null>(null, [Validators.required]),
  });

  deploySACForm: FormGroup<DeploySACForm> = new FormGroup<DeploySACForm>({
    source: new FormControl<string | null>(null),
    code: new FormControl<string | null>(null, [Validators.required]),
    issuer: new FormControl<string | null>(null),
  });

  projects$: Observable<Project[]> = this.projectsRepository.projects$;
  activeProjectViews$: Observable<ProjectView[]> = this.projectsRepository.activeProjectViews$;

  widgetTypes: WidgetType[] = Object.values(WidgetType);
  FunctionCallParameterTypes: FunctionCallParameterType[] = Object.values(FunctionCallParameterType);

  constructor(
    private readonly dialogRef: MatDialogRef<AddNewWidgetComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { projectView: ProjectView },
    private readonly matSnackBar: MatSnackBar,
    private readonly projectsRepository: ProjectsRepository,
    private readonly widgetsRepository: WidgetsRepository,
    private readonly networkLedgerService: NetworkLedgerService,
    private readonly nativeDialogsService: NativeDialogsService
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

      case WidgetType.FUNCTION_CALL:
        if (this.functionCallForm.invalid) {
          return;
        }
        newWidget = {
          _id: crypto.randomUUID(),
          project: this.baseForm.value.project as string,
          projectView: this.baseForm.value.projectView as string,
          name: this.baseForm.value.name as string,
          type: WidgetType.FUNCTION_CALL,
          source: this.functionCallForm.value.source as string,
          fnName: this.functionCallForm.value.fnName as string,
          contractId: this.functionCallForm.value.contractId as string,
          parameters: this.functionCallForm.value.parameters as FunctionCallWidget['parameters'],
        } satisfies FunctionCallWidget;
        break;

      case WidgetType.INSTALL_WASM:
        if (this.installOrDeployForm.invalid) {
          return;
        }
        newWidget = {
          _id: crypto.randomUUID(),
          project: this.baseForm.value.project as string,
          projectView: this.baseForm.value.projectView as string,
          name: this.baseForm.value.name as string,
          type: WidgetType.INSTALL_WASM,
          pathToFile: this.installOrDeployForm.value.pathToFile as string,
          source: this.installOrDeployForm.value.source as string,
        } satisfies InstallWASMWidget;
        break;

      case WidgetType.DEPLOY_SAC:
        if (this.deploySACForm.invalid) {
          return;
        }
        newWidget = {
          _id: crypto.randomUUID(),
          project: this.baseForm.value.project as string,
          projectView: this.baseForm.value.projectView as string,
          name: this.baseForm.value.name as string,
          type: WidgetType.DEPLOY_SAC,
          code: this.deploySACForm.value.code as string,
          issuer: this.deploySACForm.value.issuer as string,
        } satisfies DeploySACWidget;
        break;

      case WidgetType.DEPLOY_CONTRACT:
        if (this.installOrDeployForm.invalid) {
          return;
        }
        newWidget = {
          _id: crypto.randomUUID(),
          project: this.baseForm.value.project as string,
          projectView: this.baseForm.value.projectView as string,
          name: this.baseForm.value.name as string,
          type: WidgetType.DEPLOY_CONTRACT,
          pathToFile: this.installOrDeployForm.value.pathToFile as string,
          source: this.installOrDeployForm.value.source as string,
        } satisfies DeployContractWidget;
        break;

      case WidgetType.LEDGER_KEY_WATCHER:
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

  addFunctionCallParameter(parentControl: FormArray<FormGroup<FunctionCallParameter>>) {
    parentControl.push(
      new FormGroup<FunctionCallParameter>({
        type: new FormControl(FunctionCallParameterType.i128),
        name: new FormControl(null, [Validators.required]),
        children: new FormArray<FormGroup<FunctionCallParameter>>([]),
      })
    );
  }

  async searchFilePath(): Promise<void> {
    const filePath: string = await this.nativeDialogsService.filePath();
    this.installOrDeployForm.controls.pathToFile.setValue(filePath);
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

export interface FunctionCallParameter {
  type: FormControl<FunctionCallParameterType | null>;
  name: FormControl<string | null>;
  children: FormArray<FormGroup<FunctionCallParameter>>;
}

export interface FunctionCallForm {
  source: FormControl<string | null>;
  fnName: FormControl<string | null>;
  contractId: FormControl<string | null>;
  parameters: FormArray<FormGroup<FunctionCallParameter>>;
}

export interface InstallOrDeployWasmForm {
  source: FormControl<string | null>;
  pathToFile: FormControl<string | null>;
}

export interface DeploySACForm {
  source: FormControl<string | null>;
  code: FormControl<string | null>;
  issuer: FormControl<string | null>;
}
