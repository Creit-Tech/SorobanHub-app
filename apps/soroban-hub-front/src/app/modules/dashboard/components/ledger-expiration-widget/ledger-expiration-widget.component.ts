import { Component, DestroyRef, Input } from '@angular/core';
import { LedgerKeyExpirationWidget, WidgetsRepository } from '../../../../state/widgets/widgets.repository';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilKeyChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  share,
  Subscription,
  switchMap,
} from 'rxjs';
import { NetworkLedgerService } from '../../../../core/services/network-ledger/network-ledger.service';
import { Project } from '../../../../state/projects/projects.repository';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { getEntity, selectEntity, upsertEntities } from '@ngneat/elf-entities';
import { DateTime } from 'luxon';
import { NetworkLedgerData, NetworkLedgerRepository } from '../../../../state/network-ledger/network-ledger.repository';
import {
  Account,
  Operation,
  SorobanDataBuilder,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { IdentitiesRepository, Identity } from '../../../../state/identities/identities.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Buffer } from 'buffer';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { XdrExportComponent } from '../../../../shared/modals/xdr-export/xdr-export.component';

@Component({
  selector: 'app-ledger-expiration-widget',
  templateUrl: './ledger-expiration-widget.component.html',
  styles: ``,
})
export class LedgerExpirationWidgetComponent {
  project$: BehaviorSubject<Project | undefined> = new BehaviorSubject<Project | undefined>(undefined);
  @Input() set project(data: Project) {
    this.project$.next(data);
  }

  widget$: BehaviorSubject<LedgerKeyExpirationWidget | undefined> = new BehaviorSubject<
    LedgerKeyExpirationWidget | undefined
  >(undefined);
  @Input() set widget(data: LedgerKeyExpirationWidget) {
    this.widget$.next(data);
  }

  network$: Observable<Network | undefined> = this.project$.asObservable().pipe(
    filter(Boolean),
    switchMap((project: Project) => {
      return this.networksRepository.store.pipe(selectEntity(project.networkId));
    })
  );

  networkLedgerData$: Observable<NetworkLedgerData> = this.network$.pipe(
    filter(Boolean),
    switchMap((network: Network) => {
      return this.networkLedgerRepository.getNetwork(network.networkPassphrase);
    }),
    filter(Boolean)
  );

  liveUntilLedgerSeq$: Observable<number | undefined> = this.widget$
    .asObservable()
    .pipe(map((widget: LedgerKeyExpirationWidget | undefined) => widget?.liveUntilLedgerSeq));
  lastModifiedLedgerSeq$: Observable<number | undefined> = this.widget$
    .asObservable()
    .pipe(map((widget: LedgerKeyExpirationWidget | undefined) => widget?.lastModifiedLedgerSeq));

  secondsBeforeExpires$: Observable<number> = this.networkLedgerData$.pipe(
    switchMap((networkLedgerData: NetworkLedgerData) => {
      return this.liveUntilLedgerSeq$.pipe(
        filter(Boolean),
        map((liveUntilLedgerSeq: number): number => {
          const ledgersBeforeExpires: number =
            networkLedgerData.value < liveUntilLedgerSeq ? liveUntilLedgerSeq - networkLedgerData.value : 0;

          return ledgersBeforeExpires * 5;
        })
      );
    }),
    share()
  );

  expiresIn$: Observable<string | undefined> = this.secondsBeforeExpires$.pipe(
    map((secondsBeforeExpires: number): string => {
      return `${(secondsBeforeExpires / 60 / 60).toFixed(2)} hours`;
    })
  );

  expirationDate$: Observable<Date | undefined> = this.secondsBeforeExpires$.pipe(
    map((secondsBeforeExpires: number) => {
      return DateTime.now().plus({ second: secondsBeforeExpires }).toJSDate();
    })
  );

  isExpired$: Observable<boolean> = this.secondsBeforeExpires$.pipe(
    map((secondsBeforeExpires: number): boolean => secondsBeforeExpires <= 0)
  );

  bumpFormControl: FormControl<number | null> = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(0),
  ]);

  constructor(
    private readonly networksRepository: NetworksRepository,
    private readonly networkLedgerService: NetworkLedgerService,
    private readonly destroyRef: DestroyRef,
    private readonly networkLedgerRepository: NetworkLedgerRepository,
    private readonly widgetsRepository: WidgetsRepository,
    private readonly identitiesRepository: IdentitiesRepository,
    private readonly matSnackBar: MatSnackBar,
    private readonly matDialog: MatDialog
  ) {}

  getKeySubscription: Subscription = combineLatest([
    this.network$.pipe(filter(Boolean), distinctUntilKeyChanged('_id')),
    this.widget$.pipe(filter(Boolean), distinctUntilKeyChanged('_id')),
  ])
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: async ([network, widget]): Promise<void> => {
        const response = await this.networkLedgerService.getLedgerKey({
          rpc: network.rpcUrl,
          key: widget.key,
        });

        this.widgetsRepository.store.update(
          upsertEntities([
            {
              _id: widget._id,
              liveUntilLedgerSeq: response.entries[0].liveUntilLedgerSeq,
              lastModifiedLedgerSeq: response.entries[0].lastModifiedLedgerSeq,
            },
          ])
        );
      },
    });

  async bump(): Promise<void> {
    const widget: LedgerKeyExpirationWidget = this.widget$.getValue()!;
    const project: Project = this.project$.getValue()!;
    const identity: Identity | undefined = this.identitiesRepository.store.query(getEntity(project.defaultIdentityId));
    const network: Network | undefined = this.networksRepository.store.query(getEntity(project.networkId));

    if (!this.bumpFormControl.value || this.bumpFormControl.invalid) {
      this.matSnackBar.open(`Ledgers to bump value is incorrect`, 'close', { duration: 5000 });
      return;
    }

    if (!identity) {
      this.matSnackBar.open(`Identity is undefined, contact support`, 'close', { duration: 5000 });
      return;
    }

    if (!network) {
      this.matSnackBar.open(`Network is undefined, contact support`, 'close', { duration: 5000 });
      return;
    }

    const networkLedgerData: NetworkLedgerData | undefined = await firstValueFrom(
      this.networkLedgerRepository.getNetwork(network.networkPassphrase)
    );

    if (!networkLedgerData) {
      this.matSnackBar.open(`Network ledger data is undefined, contact support`, 'close', { duration: 5000 });
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

    const tx: Transaction = new TransactionBuilder(account, {
      fee: '10000000',
      networkPassphrase: network.networkPassphrase,
    })
      .setTimeout(0)
      .addOperation(
        Operation.extendFootprintTtl({
          extendTo: networkLedgerData.value + parseInt(this.bumpFormControl.value as any, 10),
        })
      )
      .setSorobanData(
        new SorobanDataBuilder().setReadOnly([xdr.LedgerKey.fromXDR(Buffer.from(widget.key, 'base64'))]).build()
      )
      .build();

    const sim = await rpc.simulateTransaction(tx);

    const finalTx = SorobanRpc.assembleTransaction(tx, sim).build();

    this.matDialog.open(XdrExportComponent, {
      data: {
        tx: finalTx,
      },
    });
  }

  async restore(): Promise<void> {
    const widget: LedgerKeyExpirationWidget = this.widget$.getValue()!;
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

    const tx: Transaction = new TransactionBuilder(account, {
      fee: '10000000',
      networkPassphrase: network.networkPassphrase,
    })
      .setTimeout(0)
      .addOperation(Operation.restoreFootprint({}))
      .setSorobanData(
        new SorobanDataBuilder().setReadWrite([xdr.LedgerKey.fromXDR(Buffer.from(widget.key, 'base64'))]).build()
      )
      .build();

    const sim = await rpc.simulateTransaction(tx);

    if (!SorobanRpc.Api.isSimulationSuccess(sim)) {
      throw new Error('Contract is not expired');
    }

    const finalTx = SorobanRpc.assembleTransaction(tx, sim).build();

    this.matDialog.open(XdrExportComponent, {
      data: {
        tx: finalTx,
      },
    });
  }

  async remove(): Promise<void> {
    const widget: LedgerKeyExpirationWidget | undefined = this.widget$.getValue();

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
