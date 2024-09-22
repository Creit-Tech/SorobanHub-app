import { Component, DestroyRef, inject, Input } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle } from '@angular/material/card';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { Network, NetworksRepository } from '../../../../state/networks/networks.repository';
import { NetworkLedgerService } from '../../../../core/services/network-ledger/network-ledger.service';
import { NetworkLedgerData, NetworkLedgerRepository } from '../../../../state/network-ledger/network-ledger.repository';
import { LedgerKeyExpirationWidget, WidgetsRepository } from '../../../../state/widgets/widgets.repository';
import { IdentitiesRepository, Identity } from '../../../../state/identities/identities.repository';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StellarService } from '../../../../core/services/stellar/stellar.service';
import { WidgetsService } from '../../../../core/services/widgets/widgets.service';
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
import { Project } from '../../../../state/projects/projects.repository';
import { getEntity, selectEntity, upsertEntities } from '@ngneat/elf-entities';
import { DateTime } from 'luxon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Account,
  Operation,
  SorobanDataBuilder,
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { XdrExportComponent } from '../../../../shared/modals/xdr-export/xdr-export.component';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-ledger-expiration-widget',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCard,
    MatCardHeader,
    CdkMenuTrigger,
    MatIconButton,
    MatIcon,
    MatCardContent,
    MatCardSubtitle,
    MatCardActions,
    MatFormField,
    ReactiveFormsModule,
    MatInput,
    MatButton,
    CdkMenu,
    CdkMenuItem,
    MatDivider,
    DatePipe,
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
          <mat-card-subtitle> Ledger expiration Widget </mat-card-subtitle>

          <ul class="py-[0.5rem] text-[0.75rem]">
            <li><b>Expires on ledger:</b> {{ liveUntilLedgerSeq$ | async }}</li>
            <li><b>Modified on ledger:</b> {{ lastModifiedLedgerSeq$ | async }}</li>
            <li><b>Expires on:</b> {{ expirationDate$ | async | date: 'MMM dd, yyyy' }}</li>
            <li><b>Expires in:</b> {{ expiresIn$ | async }}</li>
          </ul>
        </mat-card-content>

        <mat-card-actions class="flex w-full flex-col">
          @if ((isExpired$ | async) !== true) {
            <mat-form-field class="w-full">
              <mat-label>Ledgers to bump</mat-label>
              <input [formControl]="bumpFormControl" matInput placeholder="ex: 4000" />
            </mat-form-field>
          }

          @if (isExpired$ | async) {
            <button (click)="restore()" class="w-full" mat-raised-button color="primary">Restore</button>
          } @else {
            <button (click)="bump()" class="w-full" mat-raised-button color="primary">Bump</button>
          }
        </mat-card-actions>
      </mat-card>

      <ng-template #menuItemContext>
        <mat-card cdkMenu>
          <button (click)="edit()" mat-button cdkMenuItem class="px-[1.5rem]">Edit</button>
          <mat-divider></mat-divider>
          <button (click)="remove()" mat-button cdkMenuItem class="px-[1.5rem]">Remove</button>
        </mat-card>
      </ng-template>
    }
  `,
  styles: ``,
})
export class LedgerExpirationWidgetComponent {
  networksRepository: NetworksRepository = inject(NetworksRepository);
  networkLedgerService: NetworkLedgerService = inject(NetworkLedgerService);
  destroyRef: DestroyRef = inject(DestroyRef);
  networkLedgerRepository: NetworkLedgerRepository = inject(NetworkLedgerRepository);
  widgetsRepository: WidgetsRepository = inject(WidgetsRepository);
  identitiesRepository: IdentitiesRepository = inject(IdentitiesRepository);
  matSnackBar: MatSnackBar = inject(MatSnackBar);
  matDialog: MatDialog = inject(MatDialog);
  stellarService: StellarService = inject(StellarService);
  widgetsService: WidgetsService = inject(WidgetsService);

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

  bumpFormControl: FormControl<string | null> = new FormControl<string | null>(null, [
    Validators.required,
    Validators.min(0),
  ]);

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
    const liveUntilLedgerSeq = await firstValueFrom(this.liveUntilLedgerSeq$);

    if (!liveUntilLedgerSeq) {
      // TODO: toast this
      return;
    }

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
    } catch (e: unknown) {
      console.error(e);
      this.matSnackBar.open(`Account ${identity.address} doesn't exist in the network ${network.name}`, 'close', {
        duration: 5000,
      });
      return;
    }

    account.incrementSequenceNumber();
    const tx: Transaction = new TransactionBuilder(account, {
      fee: '10000000',
      networkPassphrase: network.networkPassphrase,
    })
      .setTimeout(0)
      .addOperation(
        Operation.extendFootprintTtl({
          extendTo: liveUntilLedgerSeq - networkLedgerData.value + parseInt(this.bumpFormControl.value!, 10),
        })
      )
      .setSorobanData(
        new SorobanDataBuilder().setReadOnly([xdr.LedgerKey.fromXDR(Buffer.from(widget.key, 'base64'))]).build()
      )
      .build();

    const finalTx = await this.stellarService.simOrRestore({ tx, rpc });

    this.matDialog.open(XdrExportComponent, {
      data: {
        tx: finalTx,
        rpcUrl: network.rpcUrl,
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
    } catch (e: unknown) {
      console.error(e);
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

    const finalTx = await this.stellarService.simOrRestore({ tx, rpc });

    this.matDialog.open(XdrExportComponent, {
      data: {
        tx: finalTx,
        rpcUrl: network.rpcUrl,
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

  async edit(): Promise<void> {
    const widget: LedgerKeyExpirationWidget | undefined = this.widget$.getValue();

    if (!widget) {
      return;
    }

    this.widgetsService.editWidget({ widget });
  }
}
