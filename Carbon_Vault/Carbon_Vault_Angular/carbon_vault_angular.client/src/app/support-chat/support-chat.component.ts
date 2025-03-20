import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';  // Importa o AuthService
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-support-chat',
  standalone: false,
  
  templateUrl: './support-chat.component.html',
  styleUrl: './support-chat.component.css'
})
export class SupportChatComponent {
  ticket: Ticket | null = null;
  private ticketsURL = `${environment.apiUrl}/Tickets`;
  
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router, private route: ActivatedRoute) { }
  ngOnInit(): void {
    const ticketId = this.route.snapshot.params['id'];
    this.getTicket(ticketId);
  }

  async getTicket(ticketId: number) {
    this.http.get<Ticket>(`${this.ticketsURL}/${ticketId}`).subscribe({
      next: (response: Ticket) => {
        this.ticket = response;
        console.log(this.ticket);
      },
      error: (error) => {
        console.error('Error fetching ticket:', error);
      }
    });
  }
  getTicketState(state: number| undefined): string {
    const states = ["Aberto", "fechado"];
    if(state == undefined)return "Unknown"
    return states[state] ?? "Unknown";
  }
  isTheAuthor(ticket: Ticket | null, message: TicketMessage): boolean {
    if(ticket  == null|| message == null) return false
    return ticket.authorId === message.autor.id;
  }
}
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

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  state: number;
  createdAt: string;
  reopenAt?: string;
  authorId: number;
  messages: TicketMessage[];
}
