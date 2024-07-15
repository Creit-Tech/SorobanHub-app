import { Component, DestroyRef, Input } from '@angular/core';
import { BehaviorSubject, distinctUntilKeyChanged, filter, map, Observable, switchMap } from 'rxjs';
import { Project } from '../../../../state/projects/projects.repository';
import { DeployContractWidget, WidgetsRepository } from '../../../../state/widgets/widgets.repository';
import { Buffer } from 'buffer';
import {
  Account,
  Address,
  hash,
  Operation,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { NetworkLedgerService } from '../../../../core/services/network-ledger/network-ledger.service';
import { NetworkLedgerRepository } from '../../../../state/network-ledger/network-ledger.repository';
import { IdentitiesRepository, Identity } from '../../../../state/identities/identities.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FilesService } from '../../../../core/services/files/files.service';
import { StellarService } from '../../../../core/services/stellar/stellar.service';
import { getEntity } from '@ngneat/elf-entities';
import { XdrExportComponent } from '../../../../shared/modals/xdr-export/xdr-export.component';
import { ProjectsService } from '../../../../core/services/projects/projects.service';
import { WidgetsService } from '../../../../core/services/widgets/widgets.service';

@Component({
  selector: 'app-deploy-contract-widget',
  templateUrl: './deploy-contract-widget.component.html',
  styles: ``,
})
export class DeployContractWidgetComponent {
  project$: BehaviorSubject<Project | undefined> = new BehaviorSubject<Project | undefined>(undefined);
  @Input() set project(data: Project) {
    this.project$.next(data);
  }

  widget$: BehaviorSubject<DeployContractWidget | undefined> = new BehaviorSubject<DeployContractWidget | undefined>(
    undefined
  );
  @Input() set widget(data: DeployContractWidget) {
    this.widget$.next(data);
  }

  fileName$: Observable<string | undefined> = this.widget$.asObservable().pipe(
    map(widget => {
      return widget?.pathToFile.replace(/^.*[\\/]/, '');
    })
  );

  fileDataHash$: Observable<string> = this.widget$.asObservable().pipe(
    filter(Boolean),
    distinctUntilKeyChanged('_id'),
    map((widget: DeployContractWidget): string => widget.pathToFile),
    switchMap(async (pathToFile: string): Promise<string> => {
      const contractData: Buffer = await this.filesService.fileData(pathToFile);
      return hash(contractData).toString('hex');
    })
  );

  constructor(
    private readonly networksRepository: NetworksRepository,
    private readonly networkLedgerService: NetworkLedgerService,
    private readonly destroyRef: DestroyRef,
    private readonly networkLedgerRepository: NetworkLedgerRepository,
    private readonly widgetsRepository: WidgetsRepository,
    private readonly identitiesRepository: IdentitiesRepository,
    private readonly matSnackBar: MatSnackBar,
    private readonly matDialog: MatDialog,
    private readonly filesService: FilesService,
    private readonly stellarService: StellarService,
    private readonly widgetsService: WidgetsService
  ) {}

  async deploy() {
    const widget: DeployContractWidget = this.widget$.getValue()!;
    const project: Project = this.project$.getValue()!;
    const identity: Identity | undefined = this.identitiesRepository.store.query(getEntity(project.defaultIdentityId));
    const network: Network | undefined = this.networksRepository.store.query(getEntity(project.networkId));

    if (!identity) {
      this.matSnackBar.open(`Identity is undefined, contact support`, 'close', { duration: 5000 });
      return;
    }

    if (!network) {
      this.matSnackBar.open(`Network is undefined, contact support`, 'close', { duration: 5000 });
      return;
    }

    const rpc: SorobanRpc.Server = new SorobanRpc.Server(network.rpcUrl);

    let account: Account;
    try {
      account = await rpc.getAccount(identity.address);
    } catch (e) {
      this.matSnackBar.open(`Account ${identity.address} doesn't exist in the network ${network.name}`, 'close', {
        duration: 5000,
      });
      return;
    }

    let contractData: Buffer;
    let contractDataHash: Buffer;
    try {
      contractData = await this.filesService.fileData(widget.pathToFile);
      contractDataHash = hash(contractData);
    } catch (e) {
      this.matSnackBar.open(`Failed to get the file data, make sure the file exists`, 'close', {
        duration: 5000,
      });
      return;
    }

    const tx: Transaction = new TransactionBuilder(account, {
      fee: '10000000',
      networkPassphrase: network.networkPassphrase,
    })
      .setTimeout(0)
      .addOperation(
        Operation.invokeHostFunction({
          func: xdr.HostFunction.hostFunctionTypeCreateContract(
            new xdr.CreateContractArgs({
              contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(
                new xdr.ContractIdPreimageFromAddress({
                  address: new Address(account.accountId()).toScAddress(),
                  salt: Buffer.from(crypto.getRandomValues(new Uint32Array(32))),
                })
              ),
              executable: xdr.ContractExecutable.contractExecutableWasm(contractDataHash),
            })
          ),
        })
      )
      .build();

    const finalTx = await this.stellarService.simOrRestore({ tx, rpc });

    this.matDialog.open(XdrExportComponent, { data: { tx: finalTx } });
  }

  async edit(): Promise<void> {
    const widget: DeployContractWidget | undefined = this.widget$.getValue();

    if (!widget) {
      return;
    }

    this.widgetsService.editWidget({ widget });
  }

  async remove(): Promise<void> {
    const widget: DeployContractWidget | undefined = this.widget$.getValue();

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
}
