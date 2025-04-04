import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';  // Importa o AuthService
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

  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) { }
  ngOnInit(): void {
    this.getTickets();
  }
  getTickets(): void {
    this.alerts.enableLoading("A carregar Tickets..");

    this.http.get<any[]>(this.ticketsURL,{ headers: this.authService.getHeaders() }).subscribe({
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
  getTicketState(state: number): string {
    const states = ["Aberto", "Fechado"];
    return states[state] ?? "Unknown";
  }
  getTicketPriority(state: number): string {
    const states = ["Alta", "Media", "Baixa"];
    return states[state] ?? "Unknown";
  }
  
  comparePriority(a: number, b: number): number {
    const priorityOrder = { 0:'Alta' , 1: 'Media', 2: 'Baixa'};
    return a - b;
  }

  getPriorityClass(priority: number): string {
    return {
      0: 'high-priority',
      1: 'medium-priority',
      2: 'low-priority'
    }[priority] || 'unknown-priority';
  }
  
  getPriorityLabel(priority: number): string {
    return {
      0: '↑ Alta',
      1: '- Média',
      2: '↓ Baixa'
    }[priority] || 'Desconhecida';
  }
  
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
  navigateToTicket(ticketId: string): void {
    
    this.router.navigate([`/support-manager/${ticketId}`]);
  }
}
enum TicketCategory {
  Compra,
  Venda,
  Transacoes,
  Relatorios,
  Outros
}
