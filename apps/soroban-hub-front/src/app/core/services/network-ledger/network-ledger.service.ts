import { Injectable } from '@angular/core';
import { Address, Networks, SorobanRpc, xdr } from '@stellar/stellar-sdk';
import { Buffer } from 'buffer';
import { NetworkLedgerRepository, UpdatingStats } from '../../../state/network-ledger/network-ledger.repository';
import { distinctUntilArrayItemChanged, setProps } from '@ngneat/elf';
import { map, Subscription, switchMap, timer } from 'rxjs';
import { selectAllEntities } from '@ngneat/elf-entities';
import { Network, NetworksRepository } from '../../../state/networks/networks.repository';

@Injectable({
  providedIn: 'root',
})
export class NetworkLedgerService {
  constructor(
    private readonly networkLedgerRepository: NetworkLedgerRepository,
    private readonly networksRepository: NetworksRepository
  ) {}

  updateLatestLedgersSubscription: Subscription = this.networksRepository.store
    .pipe(
      selectAllEntities(),
      distinctUntilArrayItemChanged(),
      switchMap((networks: Network[]) => {
        return timer(0, 5000).pipe(map(() => networks));
      })
    )
    .subscribe((networks: Network[]) => {
      for (let network of networks) {
        this.updateLatestLedger({
          network: network.networkPassphrase,
          rpcUrl: network.rpcUrl,
        }).then();
      }
    });

  @UpdatingStats
  async updateLatestLedger(params: {
    network: Networks;
    rpcUrl: string;
  }): Promise<SorobanRpc.Api.GetLatestLedgerResponse> {
    return new SorobanRpc.Server(params.rpcUrl)
      .getLatestLedger()
      .then((response: SorobanRpc.Api.GetLatestLedgerResponse) => {
        this.networkLedgerRepository.store.update(
          setProps({ [params.network]: { value: response.sequence, lastUpdate: new Date() } })
        );

        return response;
      });
  }

  createLedgerKey(params: CreateLedgerKeyParams): string {
    switch (params.type) {
      case 'CONTRACT_ID':
        return xdr.LedgerKey.contractData(
          new xdr.LedgerKeyContractData({
            contract: new Address(params.value).toScAddress(),
            key: xdr.ScVal.scvLedgerKeyContractInstance(),
            durability: xdr.ContractDataDurability.persistent(),
          })
        ).toXDR('base64');

      case 'CONTRACT_HASH':
        return xdr.LedgerKey.contractCode(
          new xdr.LedgerKeyContractCode({
            hash: Buffer.from(params.value, 'hex'),
          })
        ).toXDR('base64');

      case 'LEDGER_KEY':
        // if the user already passed the XDR, we assume is correct
        return params.value;

      default:
        throw new Error(`Unsupported type: ${params.type}`);
    }
  }

  async getLedgerKey(params: { key: string; rpc: string }) {
    const rpc: SorobanRpc.Server = new SorobanRpc.Server(params.rpc, { allowHttp: true });
    return rpc.getLedgerEntries(xdr.LedgerKey.fromXDR(Buffer.from(params.key, 'base64')));
  }
}

export interface CreateLedgerKeyParams {
  type: 'CONTRACT_ID' | 'CONTRACT_HASH' | 'LEDGER_KEY';
  value: string;
}
