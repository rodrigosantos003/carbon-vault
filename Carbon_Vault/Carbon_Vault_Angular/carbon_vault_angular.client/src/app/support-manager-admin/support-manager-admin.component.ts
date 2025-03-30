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
    var token = localStorage.getItem('token');
    var userId = this.authService.getUserId();
      const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'userID': userId
        })

    this.http.get<any[]>(this.ticketsURL,{ headers }).subscribe({
      next: (data) => {
        this.tickets = data;
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
  getCategoryName(categoryValue: 'problema_tecnico' | 'transacoes' | 'relatorio' | 'outro'): string {
    return this.categoryMap[categoryValue] || 'Categoria desconhecida';
  }
  navigateToTicket(ticketId: string): void {
    
    this.router.navigate([`/support-manager/${ticketId}`]);
  }
}
