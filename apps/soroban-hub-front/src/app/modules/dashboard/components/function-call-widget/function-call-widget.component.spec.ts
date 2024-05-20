import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionCallWidgetComponent } from './function-call-widget.component';

describe('FunctionCallWidgetComponent', () => {
  let component: FunctionCallWidgetComponent;
  let fixture: ComponentFixture<FunctionCallWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FunctionCallWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FunctionCallWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
