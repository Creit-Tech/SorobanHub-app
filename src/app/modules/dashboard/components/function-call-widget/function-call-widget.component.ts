import { Component, inject, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  FunctionCallParameterType,
  FunctionCallWidget,
  FunctionCallWidgetParameter,
  WidgetsRepository,
} from '../../../../state/widgets/widgets.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { IdentitiesRepository } from '../../../../state/identities/identities.repository';
import { StellarService } from '../../../../core/services/stellar/stellar.service';
import { WidgetsService } from '../../../../core/services/widgets/widgets.service';
import { AsyncPipe, NgTemplateOutlet, SlicePipe } from '@angular/common';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle } from '@angular/material/card';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { BehaviorSubject } from 'rxjs';
import { Project } from '../../../../state/projects/projects.repository';
import { getEntity } from '@ngneat/elf-entities';
import {
  Account,
  Address,
  Contract,
  nativeToScVal,
  rpc as SorobanRpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { XdrExportComponent } from '../../../../shared/modals/xdr-export/xdr-export.component';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-function-call-widget',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCard,
    MatCardHeader,
    CdkMenuTrigger,
    MatIcon,
    MatCardContent,
    MatIconButton,
    MatCardSubtitle,
    SlicePipe,
    CdkCopyToClipboard,
    MatCardActions,
    MatButton,
    CdkMenu,
    MatDivider,
    CdkMenuItem,
    NgTemplateOutlet,
    MatFormField,
    ReactiveFormsModule,
    MatInput,
    MatLabel,
  ],
  template: `
    @if (widget$ | async; as widget) {
      <mat-card>
        <mat-card-header class="text-[1.25rem]">
          <div class="flex w-full items-center justify-between">
            <span>{{ widget.name }}</span>

            <button [cdkMenuTriggerFor]="menuItemContext" mat-icon-button>
              <mat-icon>menu</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <mat-card-subtitle> Contract function call widget </mat-card-subtitle>

          <ul class="py-[0.5rem] text-[0.75rem]">
            @if (widget.source) {
              <li><b>Source:</b> {{ widget.source | slice: 0 : 4 }}....{{ widget.source | slice: -4 }}</li>
            }
            <li><b>Function name:</b> {{ widget.fnName }}</li>
            <li [cdkCopyToClipboard]="widget.contractId" class="cursor-pointer">
              <b>Contract ID:</b> {{ widget.contractId | slice: 0 : 4 }}....{{ widget.contractId | slice: -4 }}
            </li>
          </ul>
        </mat-card-content>

        <mat-card-actions>
          <button (click)="openModal()" class="w-full" mat-raised-button color="primary">Execute</button>
        </mat-card-actions>
      </mat-card>

      <ng-template #menuItemContext>
        <mat-card cdkMenu>
          <button (click)="edit()" mat-button cdkMenuItem class="px-[1.5rem]">Edit</button>
          <mat-divider></mat-divider>
          <button (click)="remove()" mat-button cdkMenuItem class="px-[1.5rem]">Remove</button>
        </mat-card>
      </ng-template>

      <ng-template #parametersModal>
        <mat-card class="w-[30rem]">
          <mat-card-header class="mb-[1rem]">Function parameters</mat-card-header>

          <mat-card-content>
            @for (control of parametersArrayForm.controls; track control) {
              <ng-container [ngTemplateOutlet]="parameterItem" [ngTemplateOutletContext]="{ control }"> </ng-container>
            }
          </mat-card-content>

          <mat-card-actions class="flex flex-col gap-[1rem]">
            <button (click)="onConfirm()" class="w-full" mat-raised-button color="primary">Confirm</button>

            <!--        <button (click)="resetForm()" class="mx-auto" mat-button>-->
            <!--          Reset Form-->
            <!--        </button>-->
          </mat-card-actions>
        </mat-card>
      </ng-template>
    }

    <ng-template let-control="control" #parameterItem>
      @if (
        control.value.type !== FunctionCallParameterType.vec && control.value.type !== FunctionCallParameterType.map
      ) {
        <mat-form-field class="w-full">
          <mat-label>{{ control.value.name }}</mat-label>
          <input [formControl]="control.controls.value" matInput required />
        </mat-form-field>
      } @else {
        <div class="mb-[1rem] flex w-full flex-col">
          <h3 class="mb-[1rem] w-full">{{ control.value.name }}</h3>

          <div class="w-full pl-[2rem]" style="border-left: solid 1px #ccc">
            @for (child of $any(control.controls.children.controls); track child) {
              <ng-container [ngTemplateOutlet]="parameterItem" [ngTemplateOutletContext]="{ control: child }">
              </ng-container>
            }

            @if (FunctionCallParameterType.vec === control.value.type) {
              <button (click)="addVectorItem(control.controls.children)" mat-raised-button>Add Vector field</button>
            }
          </div>
        </div>
      }
    </ng-template>
  `,
  styles: ``,
})
export class FunctionCallWidgetComponent {
  widgetsRepository: WidgetsRepository = inject(WidgetsRepository);
  matSnackBar: MatSnackBar = inject(MatSnackBar);
  matDialog: MatDialog = inject(MatDialog);
  networksRepository: NetworksRepository = inject(NetworksRepository);
  identitiesRepository: IdentitiesRepository = inject(IdentitiesRepository);
  stellarService: StellarService = inject(StellarService);
  widgetsService: WidgetsService = inject(WidgetsService);

  @ViewChild('parametersModal') parametersModal?: TemplateRef<HTMLInputElement>;

  project$: BehaviorSubject<Project | undefined> = new BehaviorSubject<Project | undefined>(undefined);
  @Input() set project(data: Project) {
    this.project$.next(data);
  }

  widget$: BehaviorSubject<FunctionCallWidget | undefined> = new BehaviorSubject<FunctionCallWidget | undefined>(
    undefined
  );
  @Input() set widget(data: FunctionCallWidget) {
    this.widget$.next(data);
    this.formBuilder(data.parameters);
  }

  parametersArrayForm: FormArray<FormGroup<FormArrayParameterItem>> = new FormArray<FormGroup<FormArrayParameterItem>>(
    []
  );

  openModal() {
    if (!this.parametersModal) {
      return;
    }

    this.matDialog.open(this.parametersModal, {
      hasBackdrop: true,
      maxHeight: '90vh',
    });
  }

  async edit(): Promise<void> {
    const widget: FunctionCallWidget | undefined = this.widget$.getValue();

    if (!widget) {
      return;
    }

    this.widgetsService.editWidget({ widget });
  }

  async remove(): Promise<void> {
    const widget: FunctionCallWidget | undefined = this.widget$.getValue();

    if (!widget) {
      return;
    }

    if (confirm(`Confirm that you want to remove the widget "${widget.name}"`)) {
      this.widgetsRepository.deleteWidget(widget._id);

      this.matSnackBar.open(`Widget "${widget.name} has been removed"`, 'close', {
        duration: 5000,
      });
    }
  }

  async onConfirm(): Promise<void> {
    const widget: FunctionCallWidget = this.widget$.getValue()!;
    const project: Project = this.project$.getValue()!;
    const publicKey: string | undefined =
      widget.source || this.identitiesRepository.store.query(getEntity(project.defaultIdentityId))?.address;
    const network: Network | undefined = this.networksRepository.store.query(getEntity(project.networkId));

    if (!publicKey) {
      this.matSnackBar.open(`Source is undefined, contact support`, 'close', { duration: 5000 });
      return;
    }

    if (!network) {
      this.matSnackBar.open(`Network is undefined, contact support`, 'close', { duration: 5000 });
      return;
    }

    const rpc: SorobanRpc.Server = this.stellarService.createRPC(network.rpcUrl);

    let account: Account;
    try {
      account = await rpc.getAccount(publicKey);
    } catch (e: unknown) {
      console.error(e);
      this.matSnackBar.open(`Account ${publicKey} doesn't exist in the network ${network.name}`, 'close', {
        duration: 5000,
      });
      return;
    }

    const parameters: xdr.ScVal[] = this.createFnArgs(this.parametersArrayForm);
    const contract: Contract = new Contract(widget.contractId);
    const tx: Transaction = new TransactionBuilder(account, {
      fee: '10000000',
      networkPassphrase: network.networkPassphrase,
    })
      .setTimeout(0)
      .addOperation(contract.call(widget.fnName, ...parameters))
      .build();

    const finalTx = await this.stellarService.simOrRestore({ tx, rpc });

    this.matDialog.open(XdrExportComponent, {
      data: {
        tx: finalTx,
        rpcUrl: network.rpcUrl,
      },
    });
  }

  createFnArgs(formArray: FormArray<FormGroup<FormArrayParameterItem>>): xdr.ScVal[] {
    const items: xdr.ScVal[] = [];

    for (const formArrayElement of formArray.controls) {
      if (formArrayElement.value.type === FunctionCallParameterType.vec) {
        items.push(xdr.ScVal.scvVec(this.createFnArgs(formArrayElement.controls.children)));
      } else if (formArrayElement.value.type === FunctionCallParameterType.map) {
        const map: xdr.ScVal = xdr.ScVal.scvMap(
          formArrayElement.controls.children.controls
            .sort((a, b) => (a.value.name! > b.value.name! ? 1 : -1))
            .map(control => {
              let val: xdr.ScVal;
              if (control.value.type === FunctionCallParameterType.vec) {
                val = xdr.ScVal.scvVec(this.createFnArgs(control.controls.children));
              } else {
                val = this.parameterParser(control.value.type!, control.value.value!);
              }

              return new xdr.ScMapEntry({
                key: this.parameterParser(FunctionCallParameterType.symbol, control.value.name!),
                val,
              });
            })
        );

        items.push(map);
      } else {
        items.push(this.parameterParser(formArrayElement.value.type!, formArrayElement.value.value!));
      }
    }

    return items;
  }

  // It parses a parameter item into
  parameterParser(type: FunctionCallParameterType, value: string): xdr.ScVal {
    switch (type) {
      case FunctionCallParameterType.address:
        return new Address(value).toScVal();

      case FunctionCallParameterType.hash:
        return xdr.ScVal.scvBytes(Buffer.from(value, 'hex'));

      case FunctionCallParameterType.symbol:
        return xdr.ScVal.scvSymbol(Buffer.from(value, 'utf-8'));

      case FunctionCallParameterType.string:
        return xdr.ScVal.scvString(Buffer.from(value, 'utf-8'));

      case FunctionCallParameterType.boolean:
        return xdr.ScVal.scvBool(Boolean(value));

      case FunctionCallParameterType.i32:
      case FunctionCallParameterType.u32:
      case FunctionCallParameterType.i64:
      case FunctionCallParameterType.u64:
      case FunctionCallParameterType.i128:
      case FunctionCallParameterType.u128:
      case FunctionCallParameterType.i256:
      case FunctionCallParameterType.u256:
        return nativeToScVal(value, { type: type });

      default:
        throw new Error(`parameter type ${type} is not supported`);
    }
  }

  formGroupCreator(param: FunctionCallWidgetParameter): FormGroup {
    return new FormGroup({
      type: new FormControl(param.type, [Validators.required]),
      name: new FormControl(param.name, [Validators.required]),
      value: new FormControl('', [Validators.required]),
      children: new FormArray(param.children.map((child: FunctionCallWidgetParameter) => this.formGroupCreator(child))),
    });
  }

  formBuilder(params: FunctionCallWidgetParameter[]) {
    if (this.parametersArrayForm.length > 0) {
      return;
    }

    for (const param of params) {
      this.parametersArrayForm.push(this.formGroupCreator(param));
    }
  }

  addVectorItem(vectorControl: FormArray<FormGroup<FormArrayParameterItem>>) {
    const firstChild = vectorControl.at(0);

    if (!firstChild) {
      this.matSnackBar.open('You need to define at least one Vector child, please edit the widget', 'Error', {
        duration: 5000,
      });
      return;
    }

    vectorControl.push(
      this.formGroupCreator({
        name: firstChild.value.name!,
        type: firstChild.value.type!,
        children: firstChild.value.children as any,
      })
    );
  }

  resetForm() {
    const widget = this.widget$.getValue();
    if (!widget) return;
    this.parametersArrayForm.reset([]);
    this.formBuilder(widget.parameters);
  }

  protected readonly FunctionCallParameterType = FunctionCallParameterType;
}

export interface FormArrayParameterItem {
  type: FormControl<FunctionCallParameterType | null>;
  name: FormControl<string | null>;
  value: FormControl<string | null>;
  children: FormArray<FormGroup<FormArrayParameterItem>>;
}
