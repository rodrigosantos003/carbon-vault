import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AlertsService } from '../alerts.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth-service.service';
import { Router } from '@angular/router';
import { TicketCategory } from '../support-chat/support-chat.component';

@Component({
  selector: 'app-user-support',
  standalone: false,

  templateUrl: './user-support.component.html',
  styleUrl: './user-support.component.css'
})
export class UserSupportComponent {
  supportForm: FormGroup;
  SearchForm: FormGroup;
  private apiUrl = `${environment.apiUrl}/Tickets/`;
  userId: string;
  ticketCategories = Object.values(TicketCategory); // Converte num array

  /**
   * Construtor do componente. Inicializa os formulários e o ID do utilizador.
   * 
   * @param fb Serviço para criar e validar formulários.
   * @param alerts Serviço para gerir alertas e mensagens para o utilizador.
   * @param http Serviço para realizar requisições HTTP.
   * @param auth Serviço de autenticação para obter o ID do utilizador.
   * @param router Serviço de navegação para alterar as rotas.
   */
  constructor(private fb: FormBuilder, private alerts: AlertsService, private http: HttpClient, private auth: AuthService, private router: Router) {
    this.supportForm = this.fb.group({
      titulo: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      descricao: ['', [Validators.required]],
    });
    this.SearchForm = this.fb.group({
      reference: ['', [Validators.required]],
    });
    this.userId = this.auth.getUserId();
  }

  /**
   * Submete o ticket de suporte com as informações fornecidas no formulário.
   * Envia os dados para a API e mostra uma mensagem de sucesso ou erro.
   */
  onSubmit() {
    if (this.supportForm.valid) {
      const formData = {
        title: this.supportForm.value.titulo,
        description: this.supportForm.value.descricao,
        AuthorId: parseInt(this.userId)
      };

      let categoryAux: string = this.supportForm.value.categoria;
      const headers = new HttpHeaders({
        "category": categoryAux,
      });

      this.http.post(this.apiUrl, formData, { headers }).subscribe({
        next: () => {
          this.alerts.enableSuccess("Ticket submetido com sucesso!");
        },
        error: (err) => {
          this.alerts.enableError("Ocorreu um erro ao submeter o Ticket");
        }
      });

    } else {
      this.alerts.enableError("Preencha todos os campos corretamente.");
    }
  }

  /**
   * Pesquisa um ticket de suporte utilizando a referência fornecida no formulário.
   * Se o ticket for encontrado, redireciona para a página de detalhes do ticket.
   */
  onSearch() {
    if (this.SearchForm.valid) {
      const reference = this.SearchForm.value.reference;

      this.http.get<any>(`${this.apiUrl}ticket/reference/${reference}`, {
        headers: this.auth.getHeaders()
      }).subscribe({
        next: (ticket) => {
          if (ticket && ticket.id) {
            this.alerts.enableSuccess('Ticket encontrado com sucesso!');
            this.router.navigate([`/support-manager/${ticket.id}`]); // Redirect to ticket details page
          } else {
            this.alerts.enableError('Ocorreu um erro ao procurar o Ticket.');
          }
        },
        error: () => {
          this.alerts.enableError('Ticket não encontrado.');
        }
      });

    } else {
      this.alerts.enableError('Preencha o campo de referência corretamente.');
    }
  }

  /**
   * Mostra a descrição completa de uma categoria de ticket.
   * 
   * @param category Categoria do ticket.
   * @returns A descrição completa da categoria.
   */
  showCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      Compra: "Ajuda com Compras de Créditos",
      Venda: "Ajuda com Vendas de Créditos",
      Transacoes: "Ajuda com Transações",
      Relatorios: "Ajuda com Relatórios",
      Outros: "Outros"
    };

    return categoryMap[category] || "Categoria desconhecida";
  }
}
