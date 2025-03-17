import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTransactionsComponent } from './admin-transactions.component';

describe('AdminTransactionsComponent', () => {
  let component: AdminTransactionsComponent;
  let fixture: ComponentFixture<AdminTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
