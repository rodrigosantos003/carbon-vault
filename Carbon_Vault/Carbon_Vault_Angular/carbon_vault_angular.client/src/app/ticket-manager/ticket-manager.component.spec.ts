import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketManagerComponent } from './ticket-manager.component';

describe('TicketManagerComponent', () => {
  let component: TicketManagerComponent;
  let fixture: ComponentFixture<TicketManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TicketManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
