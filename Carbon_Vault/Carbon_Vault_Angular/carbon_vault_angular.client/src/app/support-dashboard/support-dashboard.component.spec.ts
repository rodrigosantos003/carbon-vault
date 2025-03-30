import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportDashboardComponent } from './support-dashboard.component';

describe('SupportDashboardComponent', () => {
  let component: SupportDashboardComponent;
  let fixture: ComponentFixture<SupportDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
