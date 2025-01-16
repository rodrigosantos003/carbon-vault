import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private jwtHelper: JwtHelperService) {}

   // Check if the user is authenticated
   isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  // Log out by removing the token
  logout(): void {
    localStorage.removeItem('auth_token');
  }
}
