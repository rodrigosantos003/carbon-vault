import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AlertsService } from '../alerts.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-service.service';
import { Router } from '@angular/router';

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
  userId : string ;
  constructor(private fb: FormBuilder, private alerts: AlertsService,private http: HttpClient, private auth: AuthService, private router: Router) {
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

  onSubmit() {
    if (this.supportForm.valid) {
      const formData = {
        title: this.supportForm.value.titulo,
        description: this.supportForm.value.descricao,
        category: this.supportForm.value.categoria,
        AuthorId:  parseInt(this.userId)
      };

      this.http.post(this.apiUrl, formData).subscribe({
        next: () => {
          this.alerts.enableSuccess("Ticket submetido com sucesso!");
        },
        error: (err) => {
          console.error("Erro ao enviar ticket:", err);
          this.alerts.enableError("Ocorreu um erro ao submeter o Ticket");
        }
      });

    } else {
      this.alerts.enableError("Preencha todos os campos corretamente.");
    }
  }
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
            this.alerts.enableError('Ticket não encontrado.');
          }
        },
        error: (err) => {
          console.error('Erro ao buscar ticket:', err);
          this.alerts.enableError('Ocorreu um erro ao buscar o Ticket.');
        }
      });

    } else {
      this.alerts.enableError('Preencha o campo de referência corretamente.');
    }
  }
}
