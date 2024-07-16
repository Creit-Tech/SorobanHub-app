import { Injectable } from '@angular/core';
import { Account, Operation, SorobanRpc, Transaction, TransactionBuilder } from '@stellar/stellar-sdk';

@Injectable({
  providedIn: 'root',
})
export class StellarService {
  constructor() {}

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
}
