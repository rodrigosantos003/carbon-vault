import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManagerDetailsAdminComponent } from './project-manager-details-admin.component';

describe('ProjectManagerDetailsAdminComponent', () => {
  let component: ProjectManagerDetailsAdminComponent;
  let fixture: ComponentFixture<ProjectManagerDetailsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectManagerDetailsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManagerDetailsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
