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

  /**
   * Responsável por injetar os serviços necessários para:
   * Fazer chamadas HTTP à API (HttpClient)
   * Obter informações do utilizador autenticado (AuthService)
   * Navegar entre páginas da aplicação (Router)
   * 
   * @param http Serviço HTTP utilizado para comunicação com a API.
   * @param authService Serviço de autenticação utilizado para obter o ID do utilizador e headers com token.
   * @param router Serviço de navegação para redirecionamento entre rotas.
   */

  constructor(private http: HttpClient, private authService: AuthService, private router: Router,private alerts: AlertsService) {

  }
  /**
   * - Obtém o ID do utilizador autenticado e armazena em `accountId`.
   * - Recolhe a lista de contas de utilizadores da API.
   * - Recolhe todas as transações registadas para exibição no dashboard.
   */
  ngOnInit(): void {
    this.accountId = this.authService.getUserId();
    this.getAccounts();
    this.getTransactions();
 
  }

  /**
 * Retorna o nome da conta a partir do ID fornecido.
 * 
 * @param {number} id - O ID da conta.
 * @returns {string | undefined} Nome da conta correspondente ou "Unknown" se não for encontrada.
 */
  getAccountName(id: number): string | undefined {
    if (this.accounts) {
      return this.accounts.find(a => a.id === id)?.name;
    }

    return "Unknown";
  }

  /**
 * Faz uma chamada à API para obter todas as transações registadas.
 * Os dados são guardados na variável `accountTransactions`.
 * 
 * @returns {void}
 */
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

  /**
 * Retorna uma descrição textual do estado da transação.
 * 
 * @param {number} state - Código do estado (0: Concluído, 1: Rejeitado, 2: Por concluir).
 * @returns {string} Descrição legível do estado.
 */
  getTransactionState(state: number): string {
    const states = ["Concluido", "Rejeitado", "por concluir"];
    return states[state] ?? "Unknown";
  }

  /**
 * Retorna o estado de pagamento da transação.
 * 
 * @param {number} state - Código do estado (0: Pago, 1: Rejeitado, 2: Pendente).
 * @returns {string} Descrição legível do estado de pagamento.
 */
  getTransactionPaymentState(state: number): string {
    const states = ["Pago", "Rejeitado", "Pendente"];
    return states[state] ?? "Unknown";
  }

  /**
 * Retorna o tipo da transação.
 * 
 * @param {number} type - Código do tipo de transação (0: Compra, 1: Venda).
 * @returns {string} Tipo de transação como texto.
 */
  getTransactionType(type: number): string {
    const types = ["Compra", "Venda"];
    return types[type] ?? "Unknown";
  }
  getTransactionIsClaimedState(isClaimed: boolean): string {
    return isClaimed ? "Pagamento Efetuado" : "Por realizar";
  }

  /**
 * Obtém a lista de contas de utilizadores da API.
 * Armazena o resultado na variável `accounts`.
 * 
 * @returns {void}
 */
  getAccounts() {
    this.http.get(`${environment.apiUrl}/Accounts/users`).subscribe((data: any) => {
      this.accounts = data;
    }, error => {
      console.error("Erro no fetching da account:", error);
    });
  }

  /**
 * Redireciona para a página de detalhes da transação.
 * 
 * @param {number} transaction_id - O ID da transação a visualizar.
 * @returns {void}
 */
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
