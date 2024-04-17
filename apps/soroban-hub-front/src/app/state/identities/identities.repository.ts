import { createStore, withProps } from '@ngneat/elf';
import { withEntities, selectAllEntities } from '@ngneat/elf-entities';
import { Injectable } from '@angular/core';
import { persistState } from '@ngneat/elf-persist-state';
import { StorageStrategy } from '../storage.strategy';
import { Observable } from 'rxjs';

export enum IdentityType {
  ACCOUNT = 'public_key',
  CONTRACT = 'contract_address',
}

export interface Identity {
  _id: string;
  name: string;
  address: string;
  type: IdentityType;
}

export interface IdentitiesProps {
  savingIdentity: boolean;
}

const store = createStore(
  { name: 'identities' },
  withProps<IdentitiesProps>({
    savingIdentity: false,
  }),
  withEntities<Identity, '_id'>({ idKey: '_id' })
);

const persist = persistState(store, {
  key: 'identities',
  storage: new StorageStrategy({ encrypt: true }),
});

@Injectable({ providedIn: 'root' })
export class IdentitiesRepository {
  store = store;
  persist = persist;

  identities$: Observable<Identity[]> = store.pipe(selectAllEntities());
}
