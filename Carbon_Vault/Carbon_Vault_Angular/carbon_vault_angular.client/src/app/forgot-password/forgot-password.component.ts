import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AlertsService } from '../alerts.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,

  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isEmailSent: boolean | null = null; // Estado da envio do email
  emailErrorMessage: string | null = null;

  /**
 * Injeta os serviços necessários:
 * - FormBuilder: para criar e gerir o formulário reativo
 * - HttpClient: para enviar requisições HTTP
 * - Router: para navegação entre páginas
 * - AlertsService: para mostrar alertas de sucesso, erro e carregamento
 */
  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private alerts: AlertsService) {
    // Inicialização do FormGroup com controlos e validações
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /**
 * Método chamado quando o utilizador submete o formulário.
 * Verifica se o formulário é válido e, em caso afirmativo, chama o método para enviar o e-mail de recuperação.
 */
  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const formData = this.forgotPasswordForm.value;

      // Envio do email de recuperação
      this.sendClientEmail(formData.email)
    }
  }

  /**
 * Envia uma requisição GET para o servidor, pedindo o envio de um e-mail de recuperação de palavra-passe.
 * - Se o e-mail for válido, é enviado o e-mail de recuperação e o utilizador é redirecionado para a página de login.
 * - Caso contrário, é exibida uma mensagem de erro.
 * 
 * @param email O endereço de e-mail fornecido pelo utilizador
 */
  sendClientEmail(email: string) {
    this.alerts.enableLoading("A enviar recuperação de palavra-passe...");

    const apiUrl = `${environment.apiUrl}/Accounts/NewPassword?email=${email}`;

    this.http.get<{ message: string }>(apiUrl).subscribe({
      next: (response) => {
        if (response.message.includes("sucesso")) {
          this.alerts.disableLoading();
          this.alerts.enableSuccess("Recuperação de palavra-passe enviada para o seu e-mail!")
          this.router.navigate(['/login']);
        } else {
          this.alerts.disableLoading();
          this.alerts.enableError("E-mail inválido");
        }
      },
      error: () => {
        this.alerts.disableLoading();
        this.alerts.enableError("Erro ao enviar recuperação de palavra-passe");
      }
    })
  }
}
