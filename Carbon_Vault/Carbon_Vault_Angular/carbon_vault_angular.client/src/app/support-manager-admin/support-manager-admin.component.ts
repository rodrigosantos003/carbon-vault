import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-support-manager-admin',
  standalone: false,

  templateUrl: './support-manager-admin.component.html',
  styleUrl: './support-manager-admin.component.css'
})
export class SupportManagerAdminComponent {
  tickets: any[] = [];
  private ticketsURL = `${environment.apiUrl}/Tickets`;
  categoryMap: {
    [key in 'problema_tecnico' | 'transacoes' | 'relatorio' | 'outro']: string;
  } = {
      problema_tecnico: 'Ajuda com Compra e/ou Venda',
      transacoes: 'Ajuda com Transações',
      relatorio: 'Ajuda com Relatórios',
      outro: 'Outro'
    };

  /**
   * Construtor do componente administrativo de tickets de suporte.
   * 
   * @param http Serviço HTTP para chamadas à API.
   * @param alerts Serviço de alertas visuais.
   * @param authService Serviço de autenticação, para obter headers de autorização.
   * @param router Serviço de navegação.
   */
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) { }

  /**
   * Ciclo de vida do Angular, chamado após a inicialização do componente.
   * Inicia o carregamento dos tickets.
   */
  ngOnInit(): void {
    this.getTickets();
  }

  /**
   * Obtém todos os tickets disponíveis através da API e ordena-os por prioridade.
   */
  getTickets(): void {
    this.alerts.enableLoading("A carregar Tickets..");

    this.http.get<any[]>(this.ticketsURL, { headers: this.authService.getHeaders() }).subscribe({
      next: (data) => {

        this.tickets = data.sort((a, b) => this.comparePriority(a.priority, b.priority));

        this.alerts.disableLoading();
      },
      error: (error) => {
        this.alerts.disableLoading();
        this.alerts.enableError("Erro ao carregar Tickets");
      }
    });
  }

  /**
   * Retorna o estado textual de um ticket.
   * 
   * @param state Valor numérico do estado.
   * @returns String representando o estado.
   */
  getTicketState(state: number): string {
    const states = ["Aberto", "Fechado"];
    return states[state] ?? "Unknown";
  }

  /**
   * Retorna a prioridade textual de um ticket.
   * 
   * @param state Valor numérico da prioridade.
   * @returns String representando a prioridade.
   */
  getTicketPriority(state: number): string {
    const states = ["Alta", "Media", "Baixa"];
    return states[state] ?? "Unknown";
  }

  /**
  * Função auxiliar para ordenar tickets por prioridade (mais urgente primeiro).
  * 
  * @param a Prioridade do primeiro ticket.
  * @param b Prioridade do segundo ticket.
  * @returns Diferença entre as prioridades.
  */
  comparePriority(a: number, b: number): number {
    const priorityOrder = { 0: 'Alta', 1: 'Media', 2: 'Baixa' };
    return a - b;
  }

  /**
   * Retorna a classe CSS correspondente à prioridade do ticket.
   * 
   * @param priority Valor da prioridade (0 = Alta, 1 = Média, 2 = Baixa).
   * @returns Nome da classe CSS.
   */
  getPriorityClass(priority: number): string {
    return {
      0: 'high-priority',
      1: 'medium-priority',
      2: 'low-priority'
    }[priority] || 'unknown-priority';
  }

  /**
   * Retorna o rótulo visual para uma prioridade específica.
   * 
   * @param priority Valor da prioridade.
   * @returns Rótulo a ser exibido no UI.
   */
  getPriorityLabel(priority: number): string {
    return {
      0: '↑ Alta',
      1: '- Média',
      2: '↓ Baixa'
    }[priority] || 'Desconhecida';
  }

  /**
   * Converte o valor da categoria (enum) para um nome amigável para o utilizador.
   * 
   * @param categoryValue Valor numérico da categoria.
   * @returns Nome da categoria.
   */
  getCategoryName(categoryValue: number): string {
    switch (categoryValue) {
      case TicketCategory.Compra:
        return 'Ajuda com Compras';
      case TicketCategory.Venda:
        return 'Ajuda com Vendas';
      case TicketCategory.Transacoes:
        return 'Ajuda com Transações';
      case TicketCategory.Relatorios:
        return 'Ajuda com Relatórios';
      case TicketCategory.Outros:
        return 'Outros';
      default:
        return 'Desconhecido';
    }
  }

  /**
   * Redireciona para o detalhe de um ticket específico.
   * 
   * @param ticketId ID do ticket a visualizar.
   */
  navigateToTicket(ticketId: string): void {
    this.router.navigate([`/support-manager/${ticketId}`]);
  }
}

/**
 * Enumeração das categorias possíveis para tickets de suporte.
 */
enum TicketCategory {
  Compra,
  Venda,
  Transacoes,
  Relatorios,
  Outros
}
