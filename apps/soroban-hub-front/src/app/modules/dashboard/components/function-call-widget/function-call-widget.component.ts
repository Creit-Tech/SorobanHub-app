import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import {
  FunctionCallParameterType,
  FunctionCallWidget,
  FunctionCallWidgetParameter,
  WidgetsRepository,
} from '../../../../state/widgets/widgets.repository';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from '../../../../state/projects/projects.repository';
import { MatDialog } from '@angular/material/dialog';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { IdentitiesRepository } from '../../../../state/identities/identities.repository';
import { getEntity } from '@ngneat/elf-entities';
import {
  Account,
  Address,
  Contract,
  nativeToScVal,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { Buffer } from 'buffer';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { XdrExportComponent } from '../../../../shared/modals/xdr-export/xdr-export.component';
import { StellarService } from '../../../../core/services/stellar/stellar.service';

@Component({
  selector: 'app-function-call-widget',
  templateUrl: './function-call-widget.component.html',
  styles: ``,
})
export class FunctionCallWidgetComponent {
  FunctionCallParameterType = FunctionCallParameterType;

  @ViewChild('parametersModal') parametersModal?: TemplateRef<any>;

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

  constructor(
    private readonly widgetsRepository: WidgetsRepository,
    private readonly matSnackBar: MatSnackBar,
    private readonly matDialog: MatDialog,
    private readonly networksRepository: NetworksRepository,
    private readonly identitiesRepository: IdentitiesRepository,
    private readonly stellarService: StellarService
  ) {}

  openModal() {
    if (!this.parametersModal) {
      return;
    }

    this.matDialog.open(this.parametersModal, {
      hasBackdrop: true,
      maxHeight: '90vh',
    });
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

    const rpc: SorobanRpc.Server = new SorobanRpc.Server(network.rpcUrl);

    let account: Account;
    try {
      account = await rpc.getAccount(publicKey);
    } catch (e) {
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
            .map(
              control =>
                new xdr.ScMapEntry({
                  key: this.parameterParser(FunctionCallParameterType.symbol, control.value.name!),
                  val: this.parameterParser(control.value.type!, control.value.value!),
                })
            )
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

  formBuilder(params: FunctionCallWidgetParameter[]) {
    if (this.parametersArrayForm.length > 0) {
      return;
    }

    function formGroupCreator(param: FunctionCallWidgetParameter): FormGroup {
      return new FormGroup({
        type: new FormControl(param.type, [Validators.required]),
        name: new FormControl(param.name, [Validators.required]),
        value: new FormControl('', [Validators.required]),
        children: new FormArray(param.children.map((child: FunctionCallWidgetParameter) => formGroupCreator(child))),
      });
    }

    for (const param of params) {
      this.parametersArrayForm.push(formGroupCreator(param));
    }
  }
}

export interface FormArrayParameterItem {
  type: FormControl<FunctionCallParameterType | null>;
  name: FormControl<string | null>;
  value: FormControl<string | null>;
  children: FormArray<FormGroup<FormArrayParameterItem>>;
}
