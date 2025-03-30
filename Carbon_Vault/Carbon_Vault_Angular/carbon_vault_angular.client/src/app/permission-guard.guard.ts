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
      const userRole = await this.authService.getUserRole();
      const requiredRole = route.data['requiredRole'];

      if (userRole === requiredRole || userRole === 1) { 
        return true;
      }

      this.router.navigate(['/Unauthorized']); // Redirect if not authorized
      return false;
    } catch (error) {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
