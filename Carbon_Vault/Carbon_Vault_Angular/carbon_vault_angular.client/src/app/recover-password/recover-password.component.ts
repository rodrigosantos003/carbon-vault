import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AlertsService } from '../alerts.service';

@Component({
  selector: 'app-recover-password',
  standalone: false,

  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css'
})
export class RecoverPasswordComponent {
  recoverPasswordForm: FormGroup;

  showTooltip = false;

  passwordLength = false;
  passwordUpperCase = false;
  passwordLowerCase = false;
  passwordSpecialChar = false;

  /**
   * Construtor do componente.
   * 
   * @param fb Construtor de formulários reativos.
   * @param http Serviço HTTP para comunicação com a API.
   * @param route Serviço para aceder a parâmetros da rota (ex: token).
   * @param router Serviço de navegação.
   * @param alerts Serviço de alertas para feedback visual.
   */
  constructor(private fb: FormBuilder, private http: HttpClient, private route: ActivatedRoute, public router: Router, private alerts: AlertsService) {
    // Inicialização do FormGroup com controlos e validações
    this.recoverPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmation: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  /**
   * Valida a força da palavra-passe com base em critérios de segurança.
   * 
   * @param password Palavra-passe a validar.
   * @returns Verdadeiro se todos os critérios forem cumpridos.
   */
  validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password); // Verifica se contém pelo menos uma letra maiúscula
    const hasLowerCase = /[a-z]/.test(password); // Verifica se contém pelo menos uma letra minúscula
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Verifica se contém pelo menos um caractere especial

    // Valida todos os critérios
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasSpecialChar
    );
  }

  /**
   * Atualiza os indicadores visuais de força da palavra-passe enquanto o utilizador escreve.
   */
  updatePasswordStrength() {
    const password = this.recoverPasswordForm.get('password')?.value || '';

    this.passwordLength = password.length >= 8;
    this.passwordUpperCase = /[A-Z]/.test(password);
    this.passwordLowerCase = /[a-z]/.test(password);
    this.passwordSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  /**
   * Manipula o envio do formulário de recuperação da palavra-passe.
   * Valida os campos e envia os dados para a API.
   */
  onSubmit() {
    if (this.recoverPasswordForm.valid) {
      const formData = this.recoverPasswordForm.value;

      if (!this.isPasswordValid(formData.password) || formData.password !== formData.passwordConfirmation) {
        this.alerts.enableError("Password inválida!");
        return;
      }

      this.resetPassword(formData.password, formData.passwordConfirmation);
    }
  }

  /**
   * Submete a nova palavra-passe para a API juntamente com o token de recuperação.
   * 
   * @param password Nova palavra-passe.
   * @param passwordConfirmation Confirmação da nova palavra-passe.
   */
  resetPassword(password: string, passwordConfirmation: string) {
    const token = this.route.snapshot.queryParamMap.get('token');
    const apiUrl = `${environment.apiUrl}/Accounts/SetPassword?token=${token}`;

    this.http.post(apiUrl, { "newPassword": password, "passwordConfirmation": passwordConfirmation }).subscribe({
      next: (response) => {
        if (response.hasOwnProperty("message")) {
          this.alerts.enableSuccess("Palavra-passe recuperada com sucesso!");
          location.href = "/login";
        }
        else this.alerts.enableError("Password inválida");
      },
      error: (error) => {
        this.alerts.enableError("Erro ao alterar a password");
      }
    });
  }

  /**
   * Verifica se a palavra-passe cumpre todos os critérios de validação.
   * 
   * @param password Palavra-passe a verificar.
   * @returns Verdadeiro se for válida.
   */
  isPasswordValid(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password); // Verifica se contém pelo menos uma letra maiúscula
    const hasLowerCase = /[a-z]/.test(password); // Verifica se contém pelo menos uma letra minúscula
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Verifica se contém pelo menos um caractere especial

    // Valida todos os critérios
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasSpecialChar
    );
  }
}
