import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManagerDetailsComponent } from './project-manager-details.component';

describe('ProjectManagerDetailsComponent', () => {
  let component: ProjectManagerDetailsComponent;
  let fixture: ComponentFixture<ProjectManagerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectManagerDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManagerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
