import { Component, DestroyRef, Input } from '@angular/core';
import { LedgerKeyExpirationWidget, WidgetsRepository } from '../../../../state/widgets/widgets.repository';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilKeyChanged,
  filter,
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
import { selectEntity, upsertEntities } from '@ngneat/elf-entities';
import { DateTime } from 'luxon';
import { NetworkLedgerData, NetworkLedgerRepository } from '../../../../state/network-ledger/network-ledger.repository';

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

  constructor(
    private readonly networksRepository: NetworksRepository,
    private readonly networkLedgerService: NetworkLedgerService,
    private readonly destroyRef: DestroyRef,
    private readonly networkLedgerRepository: NetworkLedgerRepository,
    private readonly widgetsRepository: WidgetsRepository
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
}
