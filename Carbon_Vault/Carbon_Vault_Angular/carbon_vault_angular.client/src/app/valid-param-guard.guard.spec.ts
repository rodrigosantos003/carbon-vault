import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { validParamGuardGuard } from './valid-param-guard.guard';

describe('validParamGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => validParamGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
