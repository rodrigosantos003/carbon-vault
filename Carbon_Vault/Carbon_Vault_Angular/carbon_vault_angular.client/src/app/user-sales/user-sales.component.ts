import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';

@Component({
  selector: 'app-user-sales',
  standalone: false,

  templateUrl: './user-sales.component.html',
  styleUrl: './user-sales.component.css'
})
export class UserSalesComponent {
  sales: Sale[] = [];
  private salesURL: string;

  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService) {
    this.salesURL = `https://localhost:7117/api/Transactions/type/1/user/${this.authService.getUserId()}`;
  }

  ngOnInit(): void {
    this.getSales();
  }

  getSales(): void {
    this.alerts.enableLoading("A carregar compras...");

    const jwtToken = localStorage.getItem('token');

    this.http.get<Sale[]>(this.salesURL, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    }).subscribe({
      next: (data) => {
        this.sales = data;
        this.alerts.disableLoading();
      },
      error: (error) => {
        console.error("Erro ao obter compras: ", error);
        this.alerts.disableLoading();
      }
    })
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