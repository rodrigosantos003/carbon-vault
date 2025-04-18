import { Component } from '@angular/core';
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

  /**
   * Construtor do componente.
   * 
   * @param route Serviço de rota para aceder a parâmetros da URL.
   * @param http Serviço HTTP para fazer chamadas à API.
   * @param authService Serviço de autenticação para obter headers e ID do utilizador autenticado.
   * @param router Serviço de navegação Angular.
   * @param alerts Serviço para mostrar mensagens de carregamento e erro.
   */
  constructor(private route: ActivatedRoute, private http: HttpClient, private authService: AuthService, private router: Router, private alerts: AlertsService) { }

  /**
   * Ciclo de vida do componente ao iniciar.
   * Obtém o ID da conta, os dados da conta e as transações associadas.
   */
  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') ?? "";
    this.http.get(`${environment.apiUrl}/Accounts/${this.accountId}`).subscribe((data: any) => {
      this.accountData = data;
    });
    this.getTransactions(this.accountId)
  }

  /**
   * Mostra o popup de confirmação para eliminação da conta.
   */
  openDeletePopup() {
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  /**
   * Fecha o popup de confirmação de eliminação.
   */
  closePopup() {
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }

  /**
   * Elimina a conta do utilizador, caso não seja a própria conta do utilizador autenticado.
   * Mostra erro se o utilizador tentar eliminar a sua própria conta.
   */
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
            this.alerts.enableError('Error deleting the account.');
          }
        );
      } else {
        this.alerts.enableError("Token não encontrado");
      }
    } else {
      this.alerts.enableError("Erro ao obter conta");
    }
  }

  /**
   * Obtém todas as transações associadas a uma conta.
   * 
   * @param accountID ID da conta.
   */
  getTransactions(accountID: string) {
    const jwtToken = localStorage.getItem('token');

    if (!jwtToken) {
      return;
    }

    this.http.get<any[]>(`${environment.apiUrl}/Transactions/user/${accountID}`, { headers: this.authService.getHeaders() }).subscribe({
      next: (data) => {
        this.accountTransactions = data;
      },
      error: (error) => {
        this.alerts.enableError("Erro ao obter transações");
      }
    });
  }

  /**
   * Devolve o estado textual da transação.
   *
   * @param state Estado numérico da transação.
   * @returns Descrição do estado da transação.
   */
  getTransactionState(state: number): string {
    const states = ["Concluido", "Rejeitado", "por concluir"];
    return states[state] ?? "Unknown";
  }

  /**
   * Devolve o estado textual do pagamento.
   *
   * @param state Estado numérico do pagamento.
   * @returns Descrição do estado do pagamento.
   */
  getTransactionPaymentState(state: number): string {
    const states = ["Pago", "Rejeitado", "Pendente"];
    return states[state] ?? "Unknown";
  }

  /**
   * Devolve o tipo textual da transação.
   *
   * @param type Tipo numérico da transação.
   * @returns Descrição do tipo da transação.
   */
  getTransactionType(type: number): string {
    const types = ["Compra", "Venda"];
    return types[type] ?? "Unknown";
  }
}
