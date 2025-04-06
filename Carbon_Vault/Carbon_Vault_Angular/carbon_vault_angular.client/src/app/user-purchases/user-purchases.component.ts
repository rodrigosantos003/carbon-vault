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

  /**
   * Construtor do componente.
   * Inicializa o URL da API para carregar as compras do utilizador.
   *
   * @param http Serviço HTTP para comunicação com a API.
   * @param alerts Serviço de alertas para mostrar mensagens de sucesso ou erro.
   * @param authService Serviço de autenticação para obter o ID do utilizador.
   * @param router Serviço de navegação para redirecionar o utilizador.
   */
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) {
    this.purchasesURL = `${environment.apiUrl}/Transactions/type/0`;
  }

  /**
   * Método do ciclo de vida do Angular, chamado quando o componente é inicializado.
   * Chama o método `getPurchases` para carregar as compras do utilizador.
   */
  ngOnInit(): void {
    this.getPurchases();
  }

  /**
   * Método para obter as compras do utilizador da API.
   * Atualiza a lista de compras e mostra ou oculta as mensagens de carregamento.
   */
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

  /**
   * Método para navegar até a página de detalhes de uma transação específica.
   *
   * @param transaction_id ID da transação a ser visualizada.
   */
  transactionDetails(transaction_id: number) {
    this.router.navigate([`transaction-details/${transaction_id}`]);
  }

  /**
   * Método para obter o estado da transação em formato legível.
   * Converte os valores de estado da transação para um formato traduzido.
   *
   * @param state Estado da transação (por exemplo, "Approved", "Rejected", "Pending").
   * @returns O estado da transação em formato traduzido (por exemplo, "Concluído", "Rejeitado", "Pendente").
   */
  getState(state: string): string {
    switch (state) {
      case "Approved":
        return "Concluído";
      case "Rejected":
        return "Rejeitado";
      case "Pending":
        return "Pendente";
      default:
        return "Desconhecido";
    }
  }
}

/**
 * Interface que define a estrutura de uma compra.
 * Representa os dados necessários para mostrar uma compra realizada pelo utilizador.
 */
interface Purchase {
  id: number,
  projectName: string,
  quantity: number,
  date: string,
  state: string,
  checkoutSession: string,
  paymentMethod: string
}
