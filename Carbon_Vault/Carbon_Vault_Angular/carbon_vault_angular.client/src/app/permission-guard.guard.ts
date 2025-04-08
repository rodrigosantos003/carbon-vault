import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const userRole = this.authService.getUserRole();
      let requiredRoles: number[] = route.data['requiredRole'];

      if (typeof requiredRoles === 'number') {
        requiredRoles = [requiredRoles];
      }

      if (requiredRoles && requiredRoles.includes(userRole)) {
        return true;
      }

      this.router.navigate(['/Unauthorized']);
      return false;
    } catch (error) {
      this.router.navigate(['/login']);
      return false;
    }
  }
}