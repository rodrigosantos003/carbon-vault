import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: false,

  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isEmailSent: boolean | null = null; // Estado da validação do NIF
  emailErrorMessage: string | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Inicialização do FormGroup com controlos e validações
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const formData = this.forgotPasswordForm.value;
      console.log('Dados do formulário:', formData);

      // Envio do email de recuperação
      this.sendClientEmail(formData.email).then(isValid => {
        if (isValid) {
          alert("Recuperação de palavra-passe enviada para o seu e-mail!");
          document.location.href = "/login";
        } else {
          alert("Email inválido!");
        }
      });
    } else {
      alert("Formulário inválido!");
    }
  }

  async sendClientEmail(email: string): Promise<boolean> {
    const apiUrl = `https://localhost:7117/api/Accounts/ForgotPassword?email=${email}`;

    try {
      const response: any = await this.http.get(apiUrl).toPromise();

      if (response?.message) {
        this.isEmailSent = true;
        this.emailErrorMessage = null;
        return true;
      } else {
        this.isEmailSent = false;
        this.emailErrorMessage = 'Email inválido.';
        return false;
      }
    } catch (error) {
      console.error('Erro ao chamar a API:', error);
      this.isEmailSent = false;
      this.emailErrorMessage = 'Erro ao enviar email. Tente novamente mais tarde.';
      return false;
    }
  }

}
