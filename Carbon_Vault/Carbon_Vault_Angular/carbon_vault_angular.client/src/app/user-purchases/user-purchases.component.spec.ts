import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPurchasesComponent } from './user-purchases.component';

describe('UserPurchasesComponent', () => {
  let component: UserPurchasesComponent;
  let fixture: ComponentFixture<UserPurchasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserPurchasesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPurchasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
