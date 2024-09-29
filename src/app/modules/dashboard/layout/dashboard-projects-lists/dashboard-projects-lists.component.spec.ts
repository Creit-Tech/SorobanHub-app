import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProjectsListsComponent } from './dashboard-projects-lists.component';

describe('DashboardProjectsListsComponent', () => {
  let component: DashboardProjectsListsComponent;
  let fixture: ComponentFixture<DashboardProjectsListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProjectsListsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProjectsListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
