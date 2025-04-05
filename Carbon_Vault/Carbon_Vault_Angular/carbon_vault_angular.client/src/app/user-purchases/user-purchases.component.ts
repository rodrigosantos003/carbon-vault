import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../auth-service.service';
import { AlertsService } from '../alerts.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-purchases',
  standalone: false,

  templateUrl: './user-purchases.component.html',
  styleUrl: './user-purchases.component.css'
})
export class UserPurchasesComponent {
  purchases: Purchase[] = [];
  private purchasesURL: string;

  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) {
    this.purchasesURL = `${environment.apiUrl}/Transactions/type/0`;
  }

  ngOnInit(): void {
    this.getPurchases();
  }

  getPurchases(): void {
    this.alerts.enableLoading("A carregar compras..."); 
    
    this.http.get<Purchase[]>(this.purchasesURL, { headers: this.authService.getHeaders() }).subscribe({
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

  transactionDetails(transaction_id: number) {
    this.router.navigate([`transaction-details/${transaction_id}`]);
  }
}

interface Purchase {
  id: number,
  projectName: string,
  quantity: number,
  date: string,
  state: string,
  checkoutSession: string,
  paymentMethod: string
}
