import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';  // Importa o AuthService
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { AfterViewChecked, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-support-chat',
  standalone: false,

  templateUrl: './support-chat.component.html',
  styleUrl: './support-chat.component.css'
})
export class SupportChatComponent {
  ticket: Ticket | null = null;
  private ticketsURL = `${environment.apiUrl}/Tickets`;
  private ticketsMessagesURL = `${environment.apiUrl}/TicketMessages/send`;
  messageContent: string = ""
  userRole: number = 0;

  /**
   * Construtor do componente de chat de suporte.
   * 
   * @param http Serviço HTTP para chamadas à API.
   * @param alerts Serviço de alertas para mensagens visuais.
   * @param authService Serviço de autenticação para obter info do utilizador.
   * @param router Serviço de navegação.
   * @param route Permite acesso aos parâmetros da rota.
   */
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  /**
   * Método chamado após o carregamento do componente.
   * Carrega o ticket com base no ID da rota e obtém o papel do utilizador.
   */
  ngOnInit(): void {
    const ticketId = this.route.snapshot.params['id'];
    this.getTicket(ticketId);
    this.authService.getUserRole().then((role) => this.userRole = role);
  }

  /**
   * Obtém os dados de um ticket com base no seu ID.
   * 
   * @param ticketId ID do ticket a carregar.
   */
  async getTicket(ticketId: number) {
    this.http.get<Ticket>(`${this.ticketsURL}/${ticketId}`).subscribe({
      next: (response: Ticket) => {
        if (!response) {
          this.router.navigate(['/NotFound']);
          return;
        }
        this.ticket = response;
        console.log(this.ticket);
      },
      error: (error) => {
        if (error.status === 400 || error.status === 404) {
          this.router.navigate(['/NotFound']); // Navigate to NotFound page on 404 error
        }
        console.error('Error fetching ticket:', error);
      }
    });
  }

  /**
   * Converte o estado do ticket para texto legível.
   * 
   * @param state Número que representa o estado.
   * @returns Texto correspondente ao estado.
   */
  getTicketState(state: number | undefined): string {
    const states = ["Aberto", "fechado"];
    if (state == undefined) return "Unknown"
    return states[state] ?? "Unknown";
  }

  /**
   * Verifica se a mensagem foi enviada pelo autor do ticket.
   * 
   * @param ticket O ticket atual.
   * @param message Mensagem do ticket.
   * @returns True se for o autor, false caso contrário.
   */
  isTheAuthor(ticket: Ticket | null, message: TicketMessage): boolean {
    if (ticket == null || message == null) return false
    return ticket.authorId === message.autor.id;
  }

  /**
   * Envia uma nova mensagem no ticket.
   * Caso o ticket esteja fechado e o utilizador seja um utilizador comum,
   * o ticket será reaberto automaticamente.
   */
  sendMessage() {
    if (!this.messageContent.trim()) {
      alert('A mensagem não pode estar vazia!');
      return;
    }

    const userId = this.authService.getUserId();

    if (this.ticket?.state === 1 && this.userRole == 0) {
      this.ticket.state = 0;

      this.http.put(`${this.ticketsURL}/${this.ticket.id}`, { state: 0 }, { headers: this.authService.getHeaders() }).subscribe(
        () => {
          console.log('Ticket reaberto com sucesso.');
        },
        (error) => {
          console.error('Erro ao reabrir o ticket:', error);
        }
      );
    }

    const data = {
      TicketId: this.ticket?.id,
      Content: this.messageContent,
      AutorId: Number(userId)
    };

    this.http.post(this.ticketsMessagesURL, data, { headers: this.authService.getHeaders() }).subscribe(
      (response) => {
        console.log('Mensagem enviada com sucesso:', response);
        this.messageContent = '';
        this.refreshMessages();
      },
      (error) => {
        console.error('Erro ao enviar a mensagem:', error);
        alert('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.');
      }
    );
  }

  /**
  * Fecha o ticket atual. Só administradores ou autores devem ter permissão.
  */
  closeTicket() {
    this.http.put(`${this.ticketsURL}/${this.ticket?.id}`, { ...this.ticket, state: 1 }, { headers: this.authService.getHeaders() }).subscribe(
      () => {
        console.log('Ticket fechado com sucesso.');
        this.ticket!.state = 1
      },
      (error) => {
        console.error('Erro ao fechar o ticket:', error);
        alert('Ocorreu um erro ao fechar o ticket.');
      }
    );
  }

  /**
   * Atualiza os dados do ticket, incluindo as mensagens, após enviar uma nova mensagem.
   */
  refreshMessages() {
    this.getTicket(this.route.snapshot.params['id'])
  }
}

/**
 * Representa uma mensagem associada a um ticket de suporte.
 */
export interface TicketMessage {
  id: number;
  ticketId: number;
  content: string;
  autorId: number;
  sendDate: string;
  autor: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * Enumeração das categorias possíveis para um ticket de suporte.
 */
export enum TicketCategory {
  Compra = "Compra",
  Venda = "Venda",
  Transacoes = "Transacoes",
  Relatorios = "Relatorios",
  Outros = "Outros",
}

/**
 * Representa um ticket de suporte no sistema.
 */
export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: TicketCategory;
  priority: number,
  state: number;
  createdAt: string;
  reopenAt?: string;
  authorId: number;
  messages: TicketMessage[];
}
