import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth-service.service';
import { Router } from '@angular/router';
import { AlertsService } from '../alerts.service';

@Component({
  selector: 'app-admin-transactions',
  standalone: false,

  templateUrl: './admin-transactions.component.html',
  styleUrl: './admin-transactions.component.css'
})
export class AdminTransactionsComponent {
  accountId: string | null = null;
  accountTransactions: any[] = [];
  accounts: Account[] | undefined;

  constructor(private http: HttpClient, private authService: AuthService, private router: Router,private alerts: AlertsService) {

  }

  ngOnInit(): void {
    this.accountId = this.authService.getUserId();
    this.getAccounts();
    this.getTransactions();
 
  }

  getAccountName(id: number): string | undefined {
    if (this.accounts) {
      return this.accounts.find(a => a.id === id)?.name;
    }

    return "Unknown";
  }

  getTransactions() {
    const jwtToken = localStorage.getItem('token');

    if (!jwtToken) {
      console.error("JWT token not found");
      return;
    }

    this.http.get<any[]>(`${environment.apiUrl}/Transactions`, { headers: this.authService.getHeaders() }).subscribe({
      next: (data) => {
        this.accountTransactions = data;
        console.log(data);
      },
      error: (error) => {
        console.error('Error fetching transactions:', error);
      }
    });
  }
  getTransactionState(state: number): string {
    const states = ["Concluido", "Rejeitado", "por concluir"];
    return states[state] ?? "Unknown";
  }
  getTransactionPaymentState(state: number): string {
    const states = ["Pago", "Rejeitado", "Pendente"];
    return states[state] ?? "Unknown";
  }
  getTransactionType(type: number): string {
    const types = ["Compra", "Venda"];
    return types[type] ?? "Unknown";
  }
  getTransactionIsClaimedState(isClaimed: boolean): string {
    return isClaimed ? "Pagamento Efetuado" : "Por realizar";
  }

  
  getAccounts() {
    this.http.get(`${environment.apiUrl}/Accounts/users`).subscribe((data: any) => {
      this.accounts = data;
    }, error => {
      console.error("Erro no fetching da account:", error);
    });
  }

  //TODO
  transactionDetails(transaction_id: number) {
    this.router.navigate([`transaction-details/${transaction_id}`]);
  }


  processPayment(transactionId: number): void {
    this.http.patch(`${environment.apiUrl}/Transactions/process-offlinePayment` ,transactionId,{ headers: this.authService.getHeaders() }).subscribe({
      next: (res) => {
        this.alerts.enableSuccess('Pagamento processado com sucesso!',5);
        this.getTransactions(); // Refresh the transactions after processing payment
      },
      error: (err) => {
        console.error(err);
        this.alerts.enableError('Erro ao processar o pagamento.',5);
      }
    });
  }
}



interface Account {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}
