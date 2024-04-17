import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentitiesListComponent } from './identities-list.component';

describe('IdentitiesListComponent', () => {
  let component: IdentitiesListComponent;
  let fixture: ComponentFixture<IdentitiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdentitiesListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IdentitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
