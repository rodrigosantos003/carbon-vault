import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPaymentComponent } from './user-payment.component';

describe('UserPaymentComponent', () => {
  let component: UserPaymentComponent;
  let fixture: ComponentFixture<UserPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
