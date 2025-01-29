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
    localStorage.removeItem('token');
  }

  // Get the user's ID
  getUserId(): string {
    const token = localStorage.getItem('token');
    if (token === null) {
      return '';
    }
    const decodedToken = this.jwtHelper.decodeToken(token);

    return decodedToken['nameid'];
  }
}
