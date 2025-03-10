import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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

  constructor(private fb: FormBuilder, private http: HttpClient, private route: ActivatedRoute, public router: Router) {
    // Inicialização do FormGroup com controlos e validações
    this.recoverPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmation: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

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

   updatePasswordStrength() {
    const password = this.recoverPasswordForm.get('password')?.value || '';

    this.passwordLength = password.length >= 8;
    this.passwordUpperCase = /[A-Z]/.test(password);
    this.passwordLowerCase = /[a-z]/.test(password);
    this.passwordSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  
  onSubmit() {
    if (this.recoverPasswordForm.valid) {
      const formData = this.recoverPasswordForm.value;

      if (!this.isPasswordValid(formData.password) || formData.password !== formData.passwordConfirmation) {
        alert("Password inválida!");
        return;
      }

      this.resetPassword(formData.password, formData.passwordConfirmation);
    }
  }

  // Aramzenar nova palavra-passe
  resetPassword(password: string, passwordConfirmation: string) {
    const token = this.route.snapshot.queryParamMap.get('token');
    const apiUrl = `${environment.apiUrl}/Accounts/ResetPassword?token=${token}`;

    this.http.post(apiUrl, { "newPassword": password, "passwordConfirmation": passwordConfirmation }).subscribe({
      next: (response) => {
        if (response.hasOwnProperty("message")) {
          alert("Palavra-passe recuperada com sucesso!");
          location.href = "/login";
        }
        else alert("Password inválida");
      },
      error: (error) => {
        alert("Erro ao alterar a password. Tente novamente mais tarde");
      }
    });
  }

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
