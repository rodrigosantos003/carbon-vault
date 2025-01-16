import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // Corrected `styleUrl` to `styleUrls` (plural)
})
export class LoginComponent {
  
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router // Inject Router service
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email validation
      password: ['', [Validators.required, Validators.minLength(6)]], // Password validation
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value; // Capture form data

      console.log('Form Data:', formData);

    
      this.http.post('https://localhost:7117/api/Accounts/login', formData).subscribe(
        (response) => {
          console.log('Login successful!', response);
          this.router.navigate(['/dashboard']);
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
