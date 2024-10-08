import { createStore, withProps } from '@ngneat/elf';
import { withEntities, selectAllEntities } from '@ngneat/elf-entities';
import { Injectable } from '@angular/core';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import { filter, Observable, take } from 'rxjs';
import { LockScreenRepository } from '../lock-screen/lock-screen.repository';
import { StorageStrategy } from '../storage.strategy';

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

@Injectable({ providedIn: 'root' })
export class IdentitiesRepository {
  store = store;
  persist?: {
    initialized$: Observable<boolean>;
    unsubscribe(): void;
  };

  identities$: Observable<Identity[]> = store.pipe(selectAllEntities());

  constructor(private readonly lockScreenRepository: LockScreenRepository) {
    this.lockScreenRepository.isUnLocked$.pipe(filter(Boolean), take(1)).subscribe(() => {
      this.persist = persistState(store, {
        key: '@SorobanHub/identities',
        storage: new StorageStrategy({ password: this.lockScreenRepository.store.value.password! }),
      });
    });
  }
}
