import { Component, DestroyRef, Input } from '@angular/core';
import { BehaviorSubject, distinctUntilKeyChanged, filter, map, Observable, of, switchMap, withLatestFrom } from 'rxjs';
import { Project, ProjectsRepository } from '../../../../state/projects/projects.repository';
import { DeploySACWidget, WidgetsRepository } from '../../../../state/widgets/widgets.repository';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { NetworkLedgerService } from '../../../../core/services/network-ledger/network-ledger.service';
import { NetworkLedgerRepository } from '../../../../state/network-ledger/network-ledger.repository';
import { IdentitiesRepository, Identity } from '../../../../state/identities/identities.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import {
  Account,
  Asset,
  Operation,
  SorobanDataBuilder,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { getEntity, selectEntity } from '@ngneat/elf-entities';
import { XdrExportComponent } from '../../../../shared/modals/xdr-export/xdr-export.component';
import { StellarService } from '../../../../core/services/stellar/stellar.service';

@Component({
  selector: 'app-deploy-sac',
  templateUrl: './deploy-sac.component.html',
  styles: ``,
})
export class DeploySacComponent {
  project$: BehaviorSubject<Project | undefined> = new BehaviorSubject<Project | undefined>(undefined);
  @Input() set project(data: Project) {
    this.project$.next(data);
  }

  widget$: BehaviorSubject<DeploySACWidget | undefined> = new BehaviorSubject<DeploySACWidget | undefined>(undefined);
  @Input() set widget(data: DeploySACWidget) {
    this.widget$.next(data);
  }

  contractId$: Observable<string> = this.project$.asObservable().pipe(
    filter(Boolean),
    distinctUntilKeyChanged('_id'),
    switchMap((project: Project) => this.networksRepository.store.pipe(selectEntity(project.networkId))),
    filter(Boolean),
    distinctUntilKeyChanged('_id'),
    switchMap((network: Network) =>
      this.widget$.pipe(filter(Boolean), distinctUntilKeyChanged('_id'), withLatestFrom(of(network)))
    ),
    map(([widget, network]): string => new Asset(widget.code, widget.issuer).contractId(network.networkPassphrase))
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
    private readonly stellarService: StellarService,
  ) {}

  // TODO: if the contract is already deployed, we should notify the user
  async deploy(): Promise<void> {
    const widget: DeploySACWidget | undefined = this.widget$.getValue();
    const project: Project | undefined = this.project$.getValue();
    const identity: Identity | undefined = this.identitiesRepository.store.query(
      getEntity(project?.defaultIdentityId || '')
    );
    const network: Network | undefined = this.networksRepository.store.query(getEntity(project?.networkId || ''));

    if (!widget || !project || !identity || !network) {
      this.matSnackBar.open(
        `The widget/project/identity/network entity is undefined, make sure all of them are valid or contact support.`,
        'close',
        { duration: 5000 }
      );
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

    const asset: Asset = new Asset(widget.code, widget.issuer);

    const tx: Transaction = new TransactionBuilder(account, {
      fee: '10000000',
      networkPassphrase: network.networkPassphrase,
    })
      .setTimeout(0)
      .addOperation(
        Operation.invokeHostFunction({
          func: xdr.HostFunction.hostFunctionTypeCreateContract(
            new xdr.CreateContractArgs({
              contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAsset(asset.toXDRObject()),
              executable: xdr.ContractExecutable.contractExecutableStellarAsset(),
            })
          ),
          auth: [],
        })
      )
      .build();

    const finalTx = await this.stellarService.simOrRestore({ tx, rpc });

    this.matDialog.open(XdrExportComponent, {
      data: {
        tx: finalTx,
      },
    });
  }

  async remove(): Promise<void> {
    const widget: DeploySACWidget | undefined = this.widget$.getValue();

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
