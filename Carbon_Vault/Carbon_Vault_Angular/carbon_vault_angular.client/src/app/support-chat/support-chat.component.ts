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
  messageContent: string  = ""
  userRole : number = 0; 
  
  
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router, private route: ActivatedRoute) { }
  ngOnInit(): void {
    const ticketId = this.route.snapshot.params['id'];
    this.getTicket(ticketId);
    this.authService.getUserRole().then((role) =>  this.userRole = role); 
  }

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
  getTicketState(state: number| undefined): string {
    const states = ["Aberto", "fechado"];
    if(state == undefined)return "Unknown"
    return states[state] ?? "Unknown";
  }
  isTheAuthor(ticket: Ticket | null, message: TicketMessage): boolean {
    if(ticket  == null|| message == null) return false
    return ticket.authorId === message.autor.id;
  }

  // sendMessage() {
  //   if (!this.messageContent.trim()) {
  //     alert('A mensagem não pode estar vazia!');
  //     return;
  //   }
  //   var token = localStorage.getItem('token');
  //   var userId = this.authService.getUserId();

  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${token}`,
  //     'userID': userId
  //   });

  //   const data = {
  //    TicketId: this.ticket?.id,
  //     Content: this.messageContent,
  //     AutorId: Number(userId)
  //   };


  //   this.http.post(this.ticketsMessagesURL,data,{headers}).subscribe(
  //     (response) => {
  //       console.log('Mensagem enviada com sucesso:', response);
  //       this.messageContent = '';
  //       this.refreshMessages();
  //     },
  //     (error) => {
  //       console.error('Erro ao enviar a mensagem:', error);
  //       alert('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.');
  //     }
  //   );
  // }

  sendMessage() {
    if (!this.messageContent.trim()) {
      alert('A mensagem não pode estar vazia!');
      return;
    }
    
    const token = localStorage.getItem('token');
    const userId = this.authService.getUserId();
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'userID': userId
    });
  
   
    if (this.ticket?.state === 1 && this.userRole == 0) {   
      this.ticket.state = 0; 
  
      this.http.put(`${this.ticketsURL}/${this.ticket.id}`, { state: 0 }, { headers }).subscribe(
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
  
    this.http.post(this.ticketsMessagesURL, data, { headers }).subscribe(
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
  
  closeTicket() {
    const token = localStorage.getItem('token');
    const userId = this.authService.getUserId();
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'userID': userId
    });
  
    this.http.put(`${this.ticketsURL}/${this.ticket?.id}`, { ...this.ticket, state: 1 }, { headers }).subscribe(
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
  

  refreshMessages() {
     this.getTicket(this.route.snapshot.params['id'])
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
