import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportManagerAdminComponent } from './support-manager-admin.component';

describe('SupportManagerAdminComponent', () => {
  let component: SupportManagerAdminComponent;
  let fixture: ComponentFixture<SupportManagerAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportManagerAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportManagerAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
