import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-sales',
  standalone: false,

  templateUrl: './user-sales.component.html',
  styleUrl: './user-sales.component.css'
})
export class UserSalesComponent {
  sales: Sale[] = [];
  private salesURL: string;
  totalUnpaid: number = 0;

  /**
   * Construtor do componente.
   * Inicializa o componente com os serviços necessários para autenticação, alertas, e navegação.
   *
   * @param http Serviço HTTP para comunicação com a API.
   * @param alerts Serviço de alertas para mostrar mensagens de sucesso ou erro.
   * @param authService Serviço de autenticação para obter o ID do utilizador.
   * @param router Serviço de navegação para redirecionar o utilizador.
   */
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) {
    this.salesURL = `${environment.apiUrl}/Transactions/type/1`;
  }

  /**
   * Método do ciclo de vida do Angular, chamado quando o componente é inicializado.
   * Chama o método `getSales` para carregar as vendas do utilizador.
   */
  ngOnInit(): void {
    this.getSales();
    this.getUnpaidSalesTotal();


  }

  getUnpaidSalesTotal(): void {
    this.http.get<any>(`${environment.apiUrl}/Transactions/unpaid-sales/${this.authService.getUserId()}`, {
      headers: this.authService.getHeaders()
    }).subscribe({
      next: (data: any) => {
        this.totalUnpaid = data.totalUnpaid;
      },
      error: () => {
        this.alerts.enableError("Erro ao obter vendas não pagas");
      }
    });
  }
  /**
   * Método para obter as vendas do utilizador a partir da API.
   * Atualiza a lista de vendas e mostra informações de carregamento ou erro.
   */
  getSales(): void {
    this.alerts.enableLoading("A carregar vendas");
    this.http.get<Sale[]>(this.salesURL, {
      headers: this.authService.getHeaders()
    }).subscribe({
      next: (data) => {
        this.sales = data;
        this.alerts.disableLoading();
      },
      error: (error) => {
        if (error.status != 400)
          this.alerts.enableError("Erro ao obter vendas");
        this.alerts.disableLoading();
      }
    })
  }

  /**
   * Método para navegar para os detalhes de uma transação.
   * Redireciona o utilizador para a página de detalhes da transação com base no ID fornecido.
   *
   * @param transaction_id ID da transação cujos detalhes devem ser visualizados.
   */
  transactionDetails(transaction_id: number) {
    this.router.navigate([`transaction-details/${transaction_id}`]);
  }

  /**
   * Método para obter o estado de uma venda de acordo com o seu valor.
   * Converte o estado da venda para um texto mais compreensível.
   *
   * @param state Estado da venda, como "Approved", "Rejected", ou "Pending".
   * @returns O estado da venda em formato textual (por exemplo, "Concluído", "Rejeitado", "Pendente").
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
 * Interface que define a estrutura de uma venda.
 * Representa os dados necessários para mostrar uma venda, incluindo seu estado, projeto, quantidade e método de pagamento.
 */
interface Sale {
  id: number,
  projectName: string,
  quantity: number,
  date: string,
  state: string,
  checkoutSession: string,
  paymentMethod: string
}
