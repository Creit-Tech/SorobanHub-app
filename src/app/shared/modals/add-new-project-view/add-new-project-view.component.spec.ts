import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewProjectViewComponent } from './add-new-project-view.component';

describe('AddNewProjectViewComponent', () => {
  let component: AddNewProjectViewComponent;
  let fixture: ComponentFixture<AddNewProjectViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewProjectViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewProjectViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
