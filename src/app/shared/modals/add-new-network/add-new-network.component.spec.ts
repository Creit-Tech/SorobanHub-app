import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewNetworkComponent } from './add-new-network.component';

describe('AddNewNetworkComponent', () => {
  let component: AddNewNetworkComponent;
  let fixture: ComponentFixture<AddNewNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewNetworkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
