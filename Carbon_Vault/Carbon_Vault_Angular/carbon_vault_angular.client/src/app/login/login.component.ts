import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    console.log(this.authService.isAuthenticated())
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
     
      this.router.navigate(['/dashboard']);
    }
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;

      console.log('Form Data:', formData);

      this.http.post('https://localhost:7117/api/Accounts/login', formData).subscribe(
        (response: any) => {
          console.log('Login successful!', response);
          this.setToken(response.token);  // Save the token in localStorage
          this.router.navigate(['/dashboard']);  // Redirect to dashboard
        },
        (error) => {
          console.error('Login failed!', error);
        }
      );
    } else {
      console.log('Invalid form submission!');
    }
  }
}
