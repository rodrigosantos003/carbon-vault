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

  userName: string = '';
  userEmail: string = '';
  userNIF: string = '';
  userRole: number = 0;

  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.getAccounts();
    this.getPastMonthGrowthPercentage();
  }

  viewAccount(account: any) {
    this.router.navigate([`users-manager/user-details/${account.id}`]);
  }

  getAccounts(): void {
    this.alerts.enableLoading("A carregar utilizadores..");
    this.http.get<any[]>(this.userAccountsURL).subscribe({
      next: (data) => {
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

  openAddAccount() {
    const overlay = document.getElementById('addAccountPopup');
    const addPopup = document.getElementById('user-form');

    if (overlay && addPopup) {
      overlay.style.display = 'flex';
      addPopup.style.display = 'block';
    }
  }

  closeAddAccount() {
    this.selectedAccountId = null;
    const overlay = document.getElementById('addAccountPopup');
    const addPopup = document.getElementById('user-form');

    if (overlay && addPopup) {
      overlay.style.display = 'none';
      addPopup.style.display = 'none';
    }
  }

  addAccount() {
    const addURL = `${environment.apiUrl}/Accounts`;
    const newPasswordURL = `${environment.apiUrl}/Accounts/NewPassword?email=${this.userEmail}`;

    const newAccount = {
      name: this.userName,
      email: this.userEmail,
      password: 'Admin@123',
      nif: this.userNIF,
      role: Number(this.userRole)
    };


    this.http.post(addURL, newAccount).subscribe({
      next: () => {
        this.closeAddAccount();
        this.alerts.enableSuccess("Utilizador adicionado com sucesso");

        this.http.get<{ message: string }>(newPasswordURL);
      },
      error: () => {
        this.closeDeleteAccount();
        this.alerts.enableError("Erro ao adicionar utilizador");
      }
    })
  }

  openDeleteAccount(account_id: number) {
    this.selectedAccountId = account_id;
    const overlay = document.getElementById('deleteAccountPopup');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  closeDeleteAccount() {
    this.selectedAccountId = null;
    const overlay = document.getElementById('deleteAccountPopup');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }

  deleteAccount() {
    if (this.selectedAccountId !== null) {
      const deleteURL = `${this.apiURL}/${this.selectedAccountId}`;

      const jwtToken = localStorage.getItem('token');

      const userIdFromToken = this.authService.getUserId();

      if (userIdFromToken == this.selectedAccountId.toString()) {
        this.alerts.enableError("Não pode excluir a sua conta.");
        return;
      }

      if (jwtToken) {
        this.http.delete(deleteURL, {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        }).subscribe(() => {
          this.accounts = this.accounts.filter(acc => acc.id !== this.selectedAccountId);
          this.closeDeleteAccount();
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
