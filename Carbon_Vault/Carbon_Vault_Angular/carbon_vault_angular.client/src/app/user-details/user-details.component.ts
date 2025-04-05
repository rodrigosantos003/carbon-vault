import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { AlertsService } from '../alerts.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-details',
  standalone: false,

  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {
  accountId: string | null = null;
  accountData: any = null;
  private apiURL = `${environment.apiUrl}/Accounts`;
  accountTransactions: any[] = [];


  constructor(private route: ActivatedRoute, private http: HttpClient, private authService: AuthService, private router: Router, private alerts: AlertsService) { }

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') ?? "";
    this.http.get(`${environment.apiUrl}/Accounts/${this.accountId}`).subscribe((data: any) => {
      this.accountData = data;
    }, error => {
      console.error("Erro na requisição:", error);
    });
    this.getTransactions(this.accountId)
  }


  openDeletePopup() {
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }
  closePopup() {
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }
  deleteAccount() {
    if (this.accountId) {
      const deleteURL = `${this.apiURL}/${this.accountId}`;
      const jwtToken = localStorage.getItem('token');
      const userIdFromToken = this.authService.getUserId();


      if (userIdFromToken == this.accountId) {
        this.alerts.enableError("Não pode Eliminar a sua própria conta");
        return;
      }

      if (jwtToken) {
        this.http.delete(deleteURL, {
          headers: this.authService.getHeaders()
        }).subscribe(
          () => {
            this.router.navigate(['/users-manager']);
            this.closePopup();
          },
          error => {
            console.error("Error deleting account:", error);
            this.alerts.enableError('Error deleting the account.');
          }
        );
      } else {
        console.error("JWT token not found");
      }
    } else {
      console.log("Account ID is null");
    }
  }
  getTransactions(accountID: string) {
    const jwtToken = localStorage.getItem('token');

    if (!jwtToken) {
      console.error("JWT token not found");
      return;
    }

    this.http.get<any[]>(`${environment.apiUrl}/Transactions/user/${accountID}`, { headers: this.authService.getHeaders()}).subscribe({
      next: (data) => {
        this.accountTransactions = data;
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
}
