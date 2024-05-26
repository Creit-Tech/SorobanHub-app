import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploySacComponent } from './deploy-sac.component';

describe('DeploySacComponent', () => {
  let component: DeploySacComponent;
  let fixture: ComponentFixture<DeploySacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeploySacComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeploySacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
