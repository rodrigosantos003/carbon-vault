import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketPlaceNavigationComponent } from './market-place-navigation.component';

describe('MarketPlaceNavigationComponent', () => {
  let component: MarketPlaceNavigationComponent;
  let fixture: ComponentFixture<MarketPlaceNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarketPlaceNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketPlaceNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
