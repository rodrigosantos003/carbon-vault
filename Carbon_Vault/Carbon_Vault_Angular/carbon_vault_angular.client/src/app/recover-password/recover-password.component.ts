import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recover-password',
  standalone: false,

  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css'
})
export class RecoverPasswordComponent {
  recoverPasswordForm: FormGroup;
  isPasswordReset: boolean | null = null; // Estado de recuperação de password
  passwordErrorMessage: string | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient, private route: ActivatedRoute, public router: Router) {
    // Inicialização do FormGroup com controlos e validações
    this.recoverPasswordForm = this.fb.group({
      password: ['', [Validators.required]],
      passwordConfirmation: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.recoverPasswordForm.valid) {
      const formData = this.recoverPasswordForm.value;
      console.log('Dados do formulário:', formData);

      // Envio do email de recuperação
      this.resetPassowrd(formData.password, formData.passwordConfirmation).then(isValid => {
        if (isValid) {
          alert("Palavra-passe recuperada com sucesso!");
          document.location.href = "/login";
        } else {
          alert("Formato inválido!");
        }
      });
    } else {
      alert("Formato inválido!");
    }
  }

  async resetPassowrd(password: string, passwordConfirmation: string): Promise<boolean> {
    const token = this.route.snapshot.queryParamMap.get('token');
    const apiUrl = `https://localhost:7117/api/Accounts/ResetPassword?token=${token}`;

    try {
      const response: any = await this.http.post(apiUrl, { "newPassword": password, "passwordConfirmation": passwordConfirmation }).toPromise();

      if (response?.message) {
        this.isPasswordReset = true;
        this.passwordErrorMessage = null;
        return true;
      } else {
        this.isPasswordReset = false;
        this.passwordErrorMessage = 'Password inválida';
        return false;
      }
    } catch (error) {
      this.isPasswordReset = false;
      this.passwordErrorMessage = 'Erro ao alterar password. Tente novamente mais tarde.';
      return false;
    }
  }
}
