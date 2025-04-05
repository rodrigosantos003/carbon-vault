import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private jwtHelper: JwtHelperService, private router: Router,private http: HttpClient) { }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  // Log out by removing the token
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
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

  getHeaders() {
    const token = localStorage.getItem('token');
    const userId = this.getUserId();

    console.log("Token: ", token);
    console.log("User ID: ", userId);

    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'userID': userId
    });

    return headers;
  }
  getUserRole(): Promise<number> {
    return new Promise((resolve, reject) => {
      const userId = this.getUserId();
      if (!userId) {
        reject('User ID not found.');
        return;
      }

      this.http.get<any>(`${environment.apiUrl}/accounts/${userId}`).subscribe(
        (data) => resolve(data.role),
        (error) => {
          console.error('Error fetching user role:', error);
          reject(error);
        }
      );
    });
  }

  isSupportOrAdmin(): Promise<boolean> {
    return this.getUserRole().then((role) => role === 1 || role === 3);  // 3 = Support, 1 = Admin
  }

}
