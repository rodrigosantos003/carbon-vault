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

  /**
   * Construtor do componente. Inicializa os serviços necessários.
   * 
   * @param http Serviço para realizar requisições HTTP.
   * @param alerts Serviço para gerir alertas e mensagens para o utilizador.
   * @param authService Serviço de autenticação para gerir a autenticação do utilizador.
   * @param router Serviço de navegação para alterar as rotas.
   */
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) { }

  /**
   * Método de ciclo de vida do componente. Executado quando o componente é inicializado.
   * Carrega as contas de utilizadores e os dados de crescimento do mês passado.
   */
  ngOnInit(): void {
    this.getAccounts();
    this.getPastMonthGrowthPercentage();
  }

  /**
   * Navega para a página de detalhes de uma conta de utilizador.
   * 
   * @param account A conta de utilizador a ser visualizada.
   */
  viewAccount(account: any) {
    this.router.navigate([`users-manager/user-details/${account.id}`]);
  }

  /**
   * Obtém a lista de contas de utilizadores da API.
   */
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

  /**
   * Obtém os dados estatísticos de crescimento mensal dos utilizadores.
   */
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

  /**
   * Abre o formulário de adicionar um novo utilizador.
   */
  openAddAccount() {
    const overlay = document.getElementById('addAccountPopup');
    const addPopup = document.getElementById('user-form');

    if (overlay && addPopup) {
      overlay.style.display = 'flex';
      addPopup.style.display = 'block';
    }
  }

  /**
   * Fecha o formulário de adicionar um novo utilizador.
   */
  closeAddAccount() {
    this.selectedAccountId = null;
    const overlay = document.getElementById('addAccountPopup');
    const addPopup = document.getElementById('user-form');

    if (overlay && addPopup) {
      overlay.style.display = 'none';
      addPopup.style.display = 'none';
    }
  }

  /**
   * Adiciona um novo utilizador à plataforma.
   */
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
        this.http.get<{ message: string }>(newPasswordURL).subscribe({
          next: () => {
            this.closeAddAccount();
            this.alerts.enableSuccess("Utilizador adicionado com sucesso");
            window.location.reload();
          }
        });
      },
      error: () => {
        this.closeDeleteAccount();
        this.alerts.enableError("Erro ao adicionar utilizador");
      }
    })
  }

  /**
   * Abre o formulário para confirmação da eliminação de uma conta de utilizador.
   * 
   * @param account_id ID da conta a ser eliminada.
   */
  openDeleteAccount(account_id: number) {
    this.selectedAccountId = account_id;
    const overlay = document.getElementById('deleteAccountPopup');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  /**
   * Fecha o formulário de confirmação da eliminação de uma conta de utilizador.
   */
  closeDeleteAccount() {
    this.selectedAccountId = null;
    const overlay = document.getElementById('deleteAccountPopup');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }

  /**
   * Elimina uma conta de utilizador da plataforma.
   * Impede a eliminação da própria conta do utilizador autenticado.
   */
  deleteAccount() {
    if (this.selectedAccountId !== null) {
      const deleteURL = `${this.apiURL}/${this.selectedAccountId}`;

      const userIdFromToken = this.authService.getUserId();

      if (userIdFromToken == this.selectedAccountId.toString()) {
        this.closeDeleteAccount();
        this.alerts.enableError("Não pode excluir a sua conta.");
        return;
      }

      this.http.delete(deleteURL, { headers: this.authService.getHeaders() }).subscribe({
        next: (response) => {
          this.closeDeleteAccount();
          this.alerts.enableSuccess("Conta eliminada com sucesso");
          window.location.reload();
        },
        error: () => {
          this.closeDeleteAccount();
          this.alerts.enableError("Erro ao eliminar conta");
        }
      })
    } else {
      console.log("ID é null");
    }
  }
}

/**
 * Interface que define a estrutura de uma conta de utilizador.
 */
interface Account {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}
