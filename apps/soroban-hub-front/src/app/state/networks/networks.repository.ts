import { createStore, withProps } from '@ngneat/elf';
import { withEntities, selectAllEntities } from '@ngneat/elf-entities';
import { Injectable } from '@angular/core';
import { Networks } from '@stellar/stellar-sdk';
import { persistState } from '@ngneat/elf-persist-state';
import { StorageStrategy } from '../storage.strategy';
import { LockScreenRepository } from '../lock-screen/lock-screen.repository';
import { filter, Observable, take } from 'rxjs';

export interface Network {
  _id: string;
  name: string;
  rpcUrl: string;
  networkPassphrase: Networks;
}

export interface NetworksProps {}

const store = createStore(
  { name: 'networks' },
  withProps<NetworksProps>({}),
  withEntities<Network, '_id'>({ idKey: '_id' })
);

@Injectable({ providedIn: 'root' })
export class NetworksRepository {
  store = store;
  persist?: {
    initialized$: Observable<boolean>;
    unsubscribe(): void;
  };

  networks$ = store.pipe(selectAllEntities());

  constructor(private readonly lockScreenRepository: LockScreenRepository) {
    this.lockScreenRepository.isUnLocked$.pipe(filter(Boolean), take(1)).subscribe(() => {
      this.persist = persistState(store, {
        key: 'networks',
        storage: new StorageStrategy({ encrypt: true }),
      });
    });
  }
}
