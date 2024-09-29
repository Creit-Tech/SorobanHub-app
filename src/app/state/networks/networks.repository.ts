import { createStore, select, withProps } from '@ngneat/elf';
import { selectAllEntities, withEntities } from '@ngneat/elf-entities';
import { Injectable } from '@angular/core';
import { Networks } from '@stellar/stellar-sdk';
import { persistState } from '@ngneat/elf-persist-state';
import { LockScreenRepository } from '../lock-screen/lock-screen.repository';
import { filter, Observable, take } from 'rxjs';
import { StorageStrategy } from '../storage.strategy';

export interface Network {
  _id: string;
  name: string;
  rpcUrl: string;
  networkPassphrase: Networks;
}

export interface NetworksProps {
  activeNetworkPassphrase: Networks;
}

const store = createStore(
  { name: 'networks' },
  withProps<NetworksProps>({
    activeNetworkPassphrase: Networks.PUBLIC,
  }),
  withEntities<Network, '_id'>({ idKey: '_id' })
);

@Injectable({ providedIn: 'root' })
export class NetworksRepository {
  store = store;
  persist?: {
    initialized$: Observable<boolean>;
    unsubscribe(): void;
  };

  activePassphrase$ = store.pipe(select(state => state.activeNetworkPassphrase));
  networks$ = store.pipe(selectAllEntities());

  constructor(private readonly lockScreenRepository: LockScreenRepository) {
    this.lockScreenRepository.isUnLocked$.pipe(filter(Boolean), take(1)).subscribe(() => {
      this.persist = persistState(store, {
        key: '@SorobanHub/networks',
        storage: new StorageStrategy({ password: this.lockScreenRepository.store.value.password! }),
      });
    });
  }
}
