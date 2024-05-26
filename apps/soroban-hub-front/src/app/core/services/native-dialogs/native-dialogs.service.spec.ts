import { TestBed } from '@angular/core/testing';

import { NativeDialogsService } from './native-dialogs.service';

describe('NativeDialogsService', () => {
  let service: NativeDialogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NativeDialogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
