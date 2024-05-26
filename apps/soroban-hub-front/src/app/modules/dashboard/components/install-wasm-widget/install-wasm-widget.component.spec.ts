import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallWasmWidgetComponent } from './install-wasm-widget.component';

describe('InstallWasmWidgetComponent', () => {
  let component: InstallWasmWidgetComponent;
  let fixture: ComponentFixture<InstallWasmWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstallWasmWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstallWasmWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
