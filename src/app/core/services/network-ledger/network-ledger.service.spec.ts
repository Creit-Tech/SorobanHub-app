import { TestBed } from '@angular/core/testing';

import { NetworkLedgerService } from './network-ledger.service';

describe('NetworkLedgerService', () => {
  let service: NetworkLedgerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkLedgerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
