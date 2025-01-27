import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEmissionsComponent } from './user-emissions.component';

describe('UserEmissionsComponent', () => {
  let component: UserEmissionsComponent;
  let fixture: ComponentFixture<UserEmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserEmissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
