import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProjectsComponent } from './user-projects.component';

describe('UserProjectsComponent', () => {
  let component: UserProjectsComponent;
  let fixture: ComponentFixture<UserProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
