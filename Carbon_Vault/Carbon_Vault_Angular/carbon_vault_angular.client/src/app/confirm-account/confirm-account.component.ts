import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-confirm-account',
  standalone: true,
  templateUrl: './confirm-account.component.html',
  imports: [CommonModule], 
  styleUrls: ['./confirm-account.component.css']
})
export class ConfirmAccountComponent implements OnInit {
  confirmationStatus: string = 'Processing...';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private titleService: Title,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Extract token from query parameters
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      // Send confirmation request to the backend
      this.http
        .get(`https://localhost:7117/api/Accounts/Confirm?token=${token}`)
        .subscribe({
          next: () => {
            this.confirmationStatus = 'Account confirmed successfully.';
            // Redirect after a short delay
            setTimeout(() => this.router.navigate(['/home']), 3000);
          },
          error: () => {
            this.confirmationStatus = 'Failed to confirm the account. The token might be invalid or expired.';
          }
        });
    } else {
      this.confirmationStatus = 'No token provided in the URL.';
    }
    this.titleService.setTitle('About Page - My Angular App'); // Set the title here

  }

}
