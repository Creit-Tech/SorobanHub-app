import { createStore, withProps } from '@ngneat/elf';
import { withEntities, selectAllEntities, deleteEntities } from '@ngneat/elf-entities';
import { Injectable } from '@angular/core';
import { Project, ProjectView } from '../projects/projects.repository';
import { LockScreenRepository } from '../lock-screen/lock-screen.repository';
import { filter, Observable, take } from 'rxjs';
import { persistState } from '@ngneat/elf-persist-state';
import { StorageStrategy } from '../storage.strategy';

export enum WidgetType {
  LEDGER_KEY_EXPIRATION = 'LEDGER_KEY_EXPIRATION',
  LEDGER_KEY_WATCHER = 'LEDGER_KEY_WATCHER',
  FUNCTION_CALL = 'FUNCTION_CALL',
  EVENTS_TRACKER = 'EVENTS_TRACKER',
}

export interface WidgetBase {
  _id: string;
  project: Project['_id'];
  projectView: ProjectView['_id'];
  name: string;
  type: WidgetType;
}

export interface LedgerKeyExpirationWidget extends WidgetBase {
  key: string;
  liveUntilLedgerSeq?: number;
  lastModifiedLedgerSeq?: number;
  type: WidgetType.LEDGER_KEY_EXPIRATION;
}

export type Widget = LedgerKeyExpirationWidget;

export interface WidgetsProps {}

const store = createStore(
  { name: 'widgets' },
  withProps<WidgetsProps>({}),
  withEntities<Widget, '_id'>({ idKey: '_id' })
);

@Injectable({ providedIn: 'root' })
export class WidgetsRepository {
  store = store;
  persist?: {
    initialized$: Observable<boolean>;
    unsubscribe(): void;
  };

  widgets$ = store.pipe(selectAllEntities());

  constructor(private readonly lockScreenRepository: LockScreenRepository) {
    this.lockScreenRepository.isUnLocked$.pipe(filter(Boolean), take(1)).subscribe(() => {
      this.persist = persistState(store, {
        key: 'widgets',
        storage: new StorageStrategy({ encrypt: true }),
      });
    });
  }

  deleteWidget(widgetId: Widget['_id']) {
    this.store.update(deleteEntities([widgetId]));
  }
}
