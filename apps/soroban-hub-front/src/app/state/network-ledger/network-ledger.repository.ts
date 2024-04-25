import { createStore, select, withProps } from '@ngneat/elf';
import { Injectable } from '@angular/core';
import { Networks } from '@stellar/stellar-sdk';
import { Observable } from 'rxjs';
import { StateToggleDecoratorFactory } from '../state-toggle.decorator';

export interface NetworkLedgerData {
  value: number;
  lastUpdate: Date;
}

export interface NetworkLedgerProps {
  updatingStats: boolean;

  [Networks.PUBLIC]?: NetworkLedgerData;
  [Networks.TESTNET]?: NetworkLedgerData;
  [Networks.FUTURENET]?: NetworkLedgerData;
  [Networks.STANDALONE]?: NetworkLedgerData;
}

const store = createStore(
  { name: 'networkLedger' },
  withProps<NetworkLedgerProps>({
    updatingStats: false,
  })
);

@Injectable({ providedIn: 'root' })
export class NetworkLedgerRepository {
  store = store;

  updatingStats$: Observable<boolean> = this.store.pipe(
    select((response: NetworkLedgerProps) => response.updatingStats)
  );

  public$: Observable<NetworkLedgerData | undefined> = this.store.pipe(
    select((response: NetworkLedgerProps) => response[Networks.PUBLIC])
  );
  testnet$: Observable<NetworkLedgerData | undefined> = this.store.pipe(
    select((response: NetworkLedgerProps) => response[Networks.TESTNET])
  );
  futurenet$: Observable<NetworkLedgerData | undefined> = this.store.pipe(
    select((response: NetworkLedgerProps) => response[Networks.FUTURENET])
  );
  standalone$: Observable<NetworkLedgerData | undefined> = this.store.pipe(
    select((response: NetworkLedgerProps) => response[Networks.STANDALONE])
  );

  getNetwork(network: Networks): Observable<NetworkLedgerData | undefined> {
    switch (network) {
      case Networks.PUBLIC:
        return this.public$;
      case Networks.TESTNET:
        return this.testnet$;
      case Networks.FUTURENET:
        return this.futurenet$;
      case Networks.STANDALONE:
        return this.standalone$;

      case Networks.SANDBOX:
      default:
        throw new Error(`Unsupported network.`);
    }
  }
}

export const UpdatingStats = StateToggleDecoratorFactory<NetworkLedgerProps>(store, 'updatingStats');
