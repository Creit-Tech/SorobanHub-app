import { TestBed } from '@angular/core/testing';

import { IdentitiesService } from './identities.service';

describe('IdentitiesService', () => {
  let service: IdentitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdentitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
