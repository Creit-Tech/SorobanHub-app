import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgerExpirationWidgetComponent } from './ledger-expiration-widget.component';

describe('LedgerExpirationWidgetComponent', () => {
  let component: LedgerExpirationWidgetComponent;
  let fixture: ComponentFixture<LedgerExpirationWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LedgerExpirationWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LedgerExpirationWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
