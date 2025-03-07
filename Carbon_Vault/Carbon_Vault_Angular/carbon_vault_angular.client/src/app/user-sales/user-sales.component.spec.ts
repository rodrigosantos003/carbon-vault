import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSalesComponent } from './user-sales.component';

describe('UserSalesComponent', () => {
  let component: UserSalesComponent;
  let fixture: ComponentFixture<UserSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserSalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
