import { Injectable } from '@angular/core';
import { Account, Operation, rpc as SorobanRpc, Transaction, TransactionBuilder } from '@stellar/stellar-sdk';
import { allowAllModules, StellarWalletsKit, WalletNetwork, XBULL_ID } from '@creit.tech/stellar-wallets-kit';

@Injectable({
  providedIn: 'root',
})
export class StellarService {
  kit: StellarWalletsKit = new StellarWalletsKit({
    modules: allowAllModules(),
    network: WalletNetwork.PUBLIC,
    selectedWalletId: XBULL_ID,
  });

  createRPC(url: string): SorobanRpc.Server {
    return new SorobanRpc.Server(url, { allowHttp: url.includes('http://localhost') });
  }

  async simOrRestore(params: { rpc: SorobanRpc.Server; tx: Transaction }): Promise<Transaction> {
    const sim = await params.rpc.simulateTransaction(params.tx);

    if (SorobanRpc.Api.isSimulationError(sim)) {
      throw new Error(sim.error);
    }

    if (!SorobanRpc.Api.isSimulationRestore(sim)) {
      return SorobanRpc.assembleTransaction(params.tx, sim).build();
    }

    const account: Account = await params.rpc.getAccount(params.tx.source);
    let fee: number = parseInt(params.tx.fee);
    fee += parseInt(sim.restorePreamble.minResourceFee);

    return new TransactionBuilder(account, { fee: fee.toString() })
      .setNetworkPassphrase(params.tx.networkPassphrase)
      .setSorobanData(sim.restorePreamble.transactionData.build())
      .addOperation(Operation.restoreFootprint({}))
      .setTimeout(0)
      .build();
  }

  async submit(params: { rpcUrl: string; tx: Transaction }) {
    const result = await this.createRPC(params.rpcUrl).sendTransaction(params.tx);

    if (result.status === 'ERROR') {
      throw new Error('Error while sending the transaction ' + result.hash);
    }

    await this.waitUntilTxApproved(params.rpcUrl, result.hash);
  }

  async waitUntilTxApproved(rpcUrl: string, hash: string, times = 60) {
    let completed = false;
    let attempts = 0;
    while (!completed) {
      const tx = await this.createRPC(rpcUrl).getTransaction(hash);

      if (tx.status === 'NOT_FOUND') {
        await new Promise(r => setTimeout(r, 1000));
      } else if (tx.status === 'SUCCESS') {
        completed = true;
      } else {
        throw new Error(`Transaction ${hash} failed.`);
      }

      attempts++;

      if (attempts >= times) {
        throw new Error(`The network did not accept the tx ${hash} in less than ${times} seconds.`);
      }
    }
  }
}
