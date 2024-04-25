import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewWidgetComponent } from './add-new-widget.component';

describe('AddNewWidgetComponent', () => {
  let component: AddNewWidgetComponent;
  let fixture: ComponentFixture<AddNewWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
