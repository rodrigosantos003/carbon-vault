import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManagerUserComponent } from './project-manager-user.component';

describe('ProjectManagerUserComponent', () => {
  let component: ProjectManagerUserComponent;
  let fixture: ComponentFixture<ProjectManagerUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectManagerUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManagerUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
