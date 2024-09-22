import { TestBed } from '@angular/core/testing';

import { StellarService } from './stellar.service';

describe('StellarService', () => {
  let service: StellarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StellarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
