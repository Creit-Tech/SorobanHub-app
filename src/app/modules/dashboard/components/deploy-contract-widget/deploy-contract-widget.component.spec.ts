import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeployContractWidgetComponent } from './deploy-contract-widget.component';

describe('DeployContractWidgetComponent', () => {
  let component: DeployContractWidgetComponent;
  let fixture: ComponentFixture<DeployContractWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeployContractWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeployContractWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
