import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-sales',
  standalone: false,

  templateUrl: './user-sales.component.html',
  styleUrl: './user-sales.component.css'
})
export class UserSalesComponent {
  sales: Sale[] = [];
  private salesURL: string;

  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) {
    this.salesURL = `${environment.apiUrl}/Transactions/type/1/user/${this.authService.getUserId()}`;
  }

  ngOnInit(): void {
    this.getSales();
  }

  getSales(): void {
    this.alerts.enableLoading("A carregar vendas...");

    const jwtToken = localStorage.getItem('token');

    this.http.get<Sale[]>(this.salesURL, {
      headers: this.authService.getHeaders()
    }).subscribe({
      next: (data) => {
        this.sales = data;
        this.alerts.disableLoading();
      },
      error: (error) => {
        console.error("Erro ao obter vendas: ", error);
        this.alerts.disableLoading();
      }
    })
  }

  transactionDetails(transaction_id: number) {
    this.router.navigate([`transaction-details/${transaction_id}`]);
  }
}

interface Sale {
  id: number,
  project: string,
  quantity: number,
  date: string,
  state: string,
  checkoutSession: string,
  paymentMethod: string
}
