import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

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
    
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      
      this.http
        .get(`${environment.apiUrl}/Accounts/Confirm?token=${token}`)
        .subscribe({
          next: () => {
            this.confirmationStatus = 'Conta confirmada com sucesso!';
            
            setTimeout(() => this.router.navigate(['/login']), 3000);
          },
          error: () => {
            this.confirmationStatus = 'Falha ao confirmar a conta,por favor contacte o nosso suporte';
          }
        });
    } else {
      this.confirmationStatus = 'No token provided in the URL.';
    }
    this.titleService.setTitle('Carbon Vault | Confirmar conta');

  }

}
