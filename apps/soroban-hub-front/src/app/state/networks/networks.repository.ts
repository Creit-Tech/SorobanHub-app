import { createStore, withProps } from '@ngneat/elf';
import { withEntities, selectAllEntities } from '@ngneat/elf-entities';
import { Injectable } from '@angular/core';
import { Networks } from '@stellar/stellar-sdk';
import { persistState } from '@ngneat/elf-persist-state';
import { StorageStrategy } from '../storage.strategy';

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

const persist = persistState(store, {
  key: 'networks',
  storage: new StorageStrategy({ encrypt: true }),
});

@Injectable({ providedIn: 'root' })
export class NetworksRepository {
  store = store;
  persist = persist;

  networks$ = store.pipe(selectAllEntities());
}
