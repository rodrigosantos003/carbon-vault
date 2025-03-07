import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../auth-service.service';
import { AlertsService } from '../alerts.service';

@Component({
  selector: 'app-user-purchases',
  standalone: false,

  templateUrl: './user-purchases.component.html',
  styleUrl: './user-purchases.component.css'
})
export class UserPurchasesComponent {
  purchases: Purchase[] = [];
  private purchasesURL: string;

  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService) {
    this.purchasesURL = `https://localhost:7117/api/Transactions/type/0/user/${this.authService.getUserId()}`;
  }

  ngOnInit(): void {
    this.getPurchases();
  }

  getPurchases(): void {
    this.alerts.enableLoading("A carregar compras...");

    const jwtToken = localStorage.getItem('token');

    this.http.get<Purchase[]>(this.purchasesURL, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    }).subscribe({
      next: (data) => {
        this.purchases = data;
        this.alerts.disableLoading();
      },
      error: (error) => {
        console.error("Erro ao obter compras: ", error);
        this.alerts.disableLoading();
      }
    })
  }
}

interface Purchase {
  id: number,
  project: string,
  quantity: number,
  date: string,
  state: string,
  checkoutSession: string,
  paymentMethod: string
}