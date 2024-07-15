import { Component, DestroyRef, Input } from '@angular/core';
import { DeploySACWidget, InstallWASMWidget, WidgetsRepository } from '../../../../state/widgets/widgets.repository';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { NetworkLedgerService } from '../../../../core/services/network-ledger/network-ledger.service';
import { NetworkLedgerData, NetworkLedgerRepository } from '../../../../state/network-ledger/network-ledger.repository';
import { IdentitiesRepository, Identity } from '../../../../state/identities/identities.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, distinctUntilKeyChanged, filter, firstValueFrom, map, Observable, switchMap } from 'rxjs';
import { Project } from '../../../../state/projects/projects.repository';
import { FilesService } from '../../../../core/services/files/files.service';
import { Buffer } from 'buffer';
import { getEntity } from '@ngneat/elf-entities';
import {
  Account,
  hash,
  Operation,
  SorobanDataBuilder,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { XdrExportComponent } from '../../../../shared/modals/xdr-export/xdr-export.component';
import { StellarService } from '../../../../core/services/stellar/stellar.service';
import { WidgetsService } from '../../../../core/services/widgets/widgets.service';

@Component({
  selector: 'app-install-wasm-widget',
  templateUrl: './install-wasm-widget.component.html',
  styles: ``,
})
export class InstallWasmWidgetComponent {
  project$: BehaviorSubject<Project | undefined> = new BehaviorSubject<Project | undefined>(undefined);
  @Input() set project(data: Project) {
    this.project$.next(data);
  }

  widget$: BehaviorSubject<InstallWASMWidget | undefined> = new BehaviorSubject<InstallWASMWidget | undefined>(
    undefined
  );
  @Input() set widget(data: InstallWASMWidget) {
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
    map((widget: InstallWASMWidget): string => widget.pathToFile),
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

  // TODO: it could be a good idea to check if the WASM is already installed and notify if that's the case
  async install() {
    const widget: InstallWASMWidget = this.widget$.getValue()!;
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
          func: xdr.HostFunction.hostFunctionTypeUploadContractWasm(contractData),
        })
      )
      .setSorobanData(
        new SorobanDataBuilder()
          .setReadWrite([xdr.LedgerKey.contractCode(new xdr.LedgerKeyContractCode({ hash: contractDataHash }))])
          .build()
      )
      .build();

    const finalTx = await this.stellarService.simOrRestore({ tx, rpc });

    this.matDialog.open(XdrExportComponent, {
      data: {
        tx: finalTx,
      },
    });
  }

  async edit(): Promise<void> {
    const widget: InstallWASMWidget | undefined = this.widget$.getValue();

    if (!widget) {
      return;
    }

    this.widgetsService.editWidget({ widget });
  }

  async remove(): Promise<void> {
    const widget: InstallWASMWidget | undefined = this.widget$.getValue();

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
