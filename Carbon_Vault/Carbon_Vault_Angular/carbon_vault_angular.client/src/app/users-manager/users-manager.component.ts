import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
/*import { ConfirmAccountComponent } from '../confirm-account/confirm-account.component';*/
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';  // Importa o AuthService
import { Router } from '@angular/router';  
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-users-manager',
  standalone: false,
  
  templateUrl: './users-manager.component.html',
  styleUrl: './users-manager.component.css'
})
export class UsersManagerComponent {
  accounts: Account[] = [];
  private userAccountsURL = `${environment.apiUrl}/Accounts/users`;
  private selectedAccountId: number | null = null;
  private apiURL = `${environment.apiUrl}/Accounts`;
  private growthPercentageMonthlyURL = `${environment.apiUrl}/Accounts/UserStatistics`;
  growthData: any = {};

  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router ) { }

  ngOnInit(): void {
    this.getAccounts();
    this.getPastMonthGrowthPercentage();
    console.log(this.accounts);
  }

  openPopup(account_id: number) {
    this.selectedAccountId = account_id;
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  closePopup() {
    this.selectedAccountId = null;
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }

  viewAccount(account: any) {
    this.router.navigate([`users-manager/user-details/${account.id}`]);
  }

  getAccounts(): void {
    this.alerts.enableLoading("A carregar utilizadores..");
    this.http.get<any[]>(this.userAccountsURL).subscribe({
      next: (data) => {
        console.log(data);
        this.accounts = data; // Armazena os dados da API no array
        this.alerts.disableLoading();
      },
      error: (error) => {
        console.error('Erro ao encontrar as contas:', error);
        this.alerts.disableLoading();
      }
    });
  }

  getPastMonthGrowthPercentage(): void {
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const params = { 
      startDate: firstDayLastMonth.toISOString(), 
      endDate: lastDayLastMonth.toISOString() 
    };
    
    this.http.get<any>(this.growthPercentageMonthlyURL, { params }).subscribe({
      next: (data) => {
        this.growthData = data;
      },
      error: (error) => {
        console.error('Error fetching growth data:', error);
      }
    });
  }


  deleteAccount() {
    if (this.selectedAccountId !== null) {
      const deleteURL = `${this.apiURL}/${this.selectedAccountId}`;
      console.log("ID da conta a eliminar: " + this.selectedAccountId);

      const jwtToken = localStorage.getItem('token');

      const userIdFromToken = this.authService.getUserId();

      if (userIdFromToken == this.selectedAccountId.toString()) {
        alert("Não pode excluir a sua conta.");
        return;
      }

      if (jwtToken) {
        this.http.delete(deleteURL, {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        }).subscribe(() => {
          this.accounts = this.accounts.filter(acc => acc.id !== this.selectedAccountId);
          this.closePopup();
        }, error => {
          console.error("Erro ao eliminar conta:", error);
        });
      } else {
        console.error("JWT não encontrado");
      }
    } else {
      console.log("ID é null");
    }
  }

}
interface Account {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}
