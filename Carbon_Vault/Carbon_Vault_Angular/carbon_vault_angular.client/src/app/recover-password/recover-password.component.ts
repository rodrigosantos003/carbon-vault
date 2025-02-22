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
    const apiUrl = `https://localhost:7117/api/Accounts/ResetPassword?token=${token}`;

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
