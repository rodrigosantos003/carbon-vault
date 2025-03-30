import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestReportComponent } from './request-report.component';

describe('RequestReportComponent', () => {
  let component: RequestReportComponent;
  let fixture: ComponentFixture<RequestReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
