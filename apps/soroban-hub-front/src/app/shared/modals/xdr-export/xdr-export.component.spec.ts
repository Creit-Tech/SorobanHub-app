import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XdrExportComponent } from './xdr-export.component';

describe('XdrExportComponent', () => {
  let component: XdrExportComponent;
  let fixture: ComponentFixture<XdrExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XdrExportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(XdrExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
