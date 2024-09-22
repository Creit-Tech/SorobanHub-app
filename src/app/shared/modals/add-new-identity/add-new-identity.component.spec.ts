import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewIdentityComponent } from './add-new-identity.component';

describe('AddNewIdentityComponent', () => {
  let component: AddNewIdentityComponent;
  let fixture: ComponentFixture<AddNewIdentityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewIdentityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewIdentityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
