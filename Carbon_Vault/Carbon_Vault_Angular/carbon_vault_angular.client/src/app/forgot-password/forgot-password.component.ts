import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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

  constructor(private fb: FormBuilder, private http: HttpClient , private router : Router) {
    // Inicialização do FormGroup com controlos e validações
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const formData = this.forgotPasswordForm.value;

      // Envio do email de recuperação
      this.sendClientEmail(formData.email)
    }
  }

  sendClientEmail(email: string) {
    const apiUrl = `${environment.apiUrl}/Accounts/ForgotPassword?email=${email}`;

    this.http.get(apiUrl).subscribe({
      next: (response) => {
        if (response.hasOwnProperty("message")) {
          alert("Recuperação de palavra-passe enviada para o seu e-mail!");
          this.router.navigate(['/login']);
        } else alert("E-mail inválido");
      },
      error: (error) => alert("Erro ao enviar e-mail de recuperação")
    })
  }
}
