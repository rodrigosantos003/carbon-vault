import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { permissionGuardGuard } from './permission-guard.guard';

describe('permissionGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => permissionGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
