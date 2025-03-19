import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSupportComponent } from './user-support.component';

describe('UserSupportComponent', () => {
  let component: UserSupportComponent;
  let fixture: ComponentFixture<UserSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserSupportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
