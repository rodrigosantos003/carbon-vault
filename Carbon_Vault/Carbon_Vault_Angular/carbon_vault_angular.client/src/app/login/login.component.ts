import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { AlertsService } from '../alerts.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  /**
 * Injeta os serviços necessários para o funcionamento do componente:
 * - `FormBuilder`: Para construção do formulário reativo.
 * - `HttpClient`: Para realizar as requisições HTTP.
 * - `Router`: Para navegação entre as páginas.
 * - `AuthService`: Para verificar se o utilizador está autenticado.
 * - `AlertsService`: Para mostrar alertas de sucesso, erro, e loading.
 */
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService, // Inject AuthService
    private alerts: AlertsService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
 * Método de inicialização do componente.
 * Fecha qualquer popup aberto, e verifica se o utilizador já está autenticado.
 * Se estiver autenticado, redireciona o utilizador para o dashboard.
 */
  ngOnInit(): void {
    this.alerts.closePopup();

    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
 * Armazena o token JWT no localStorage para manter o utilizador autenticado.
 * 
 * @param {string} token - O token JWT recebido da resposta de login.
 */
  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  /**
 * Valida o formulário e, se válido, faz a requisição de login.
 * Se o login for bem-sucedido, armazena o token e redireciona para o dashboard.
 * Caso contrário, mostra um erro.
 */
  onSubmit() {
    if (this.loginForm.valid) {
      this.alerts.enableLoading("A verificar as credenciais...");

      const formData = this.loginForm.value;

      this.http.post(`${environment.apiUrl}/Accounts/login`, formData).subscribe(
        (response: any) => {
          this.alerts.disableLoading();
          this.alerts.enableSuccess("Login bem sucedido!");
          this.setToken(response.token);  // Save the token in localStorage
          this.router.navigate(['/dashboard']);  // Redirect to dashboard
        },
        (error) => {
          console.error('Login failed!', error);
          this.alerts.disableLoading();
          this.alerts.enableError("Credenciais inválidas");
        }
      );
    } else {
      this.alerts.enableError("Dados em falta");
    }
  }
}
