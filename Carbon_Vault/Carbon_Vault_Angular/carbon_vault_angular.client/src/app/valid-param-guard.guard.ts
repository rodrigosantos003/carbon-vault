import { CanActivateFn } from '@angular/router';

export const validParamGuard: CanActivateFn = (route, state) => {
  return true;
};
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValidParamGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    const id = route.paramMap.get('id');
    
    
    if (id  && id.match(/^[0-9]+$/)) { 
      return true;
    } else {
      console.log('Invalid ID format:', id);
      this.router.navigate(['/NotFound']);  
      return false;
    }
  }
}
