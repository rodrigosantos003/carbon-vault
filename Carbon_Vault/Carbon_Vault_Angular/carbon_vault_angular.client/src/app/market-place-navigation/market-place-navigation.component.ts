
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-market-place-navigation',
  standalone: false,

  templateUrl: './market-place-navigation.component.html',
  styleUrl: './market-place-navigation.component.css'
})
export class MarketPlaceNavigationComponent {
  @ViewChild('loginBtn', { static: true }) loginBtn!: ElementRef<HTMLButtonElement>;
  isUserLoggedIn: boolean = false;

  userId: string;
  userInitial: string;

  /**
 * Injeta os serviços necessários para o funcionamento do componente:
 * - `HttpClient`: Para fazer requisições à API e obter dados do utilizador.
 * - `Router`: Para navegação entre páginas.
 * - `AuthService`: Para verificar o estado de autenticação do utilizador.
 */
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) {
    this.userInitial = ''
    this.userId = this.authService.getUserId();
  }

  /**
 * Método de inicialização do componente. 
 * Faz uma requisição HTTP para obter as informações do utilizador logado (como inicial do nome) 
 * e configura o texto do botão de login com base no estado de autenticação.
 */
  ngOnInit(): void {
    const url = `${environment.apiUrl}/accounts/${this.userId}`;

    this.http.get(url).subscribe(
      (data: any) => {
        // Se a requisição for bem-sucedida, preenche o formulário com os dados recebidos

        this.userInitial = data.name[0]
      },
      error => {
        // Caso contrário, imprime o erro no console
        console.error("Erro na requisição:", error);
      }
    );

    this.changeLoginBtnText();
  }

  /**
 * Altera o texto e o comportamento do botão de login/terminar sessão com base no estado de autenticação do utilizador.
 * Se o utilizador estiver logado, o texto é alterado para "Terminar Sessão" e o botão executa o logout.
 * Caso contrário, o texto é alterado para "Entrar" e o botão redireciona o utilizador para a página de login.
 */
  changeLoginBtnText(): void {
    this.isUserLoggedIn = this.authService.isAuthenticated();
    if (this.isUserLoggedIn) {

      this.loginBtn.nativeElement.innerHTML = "Terminar Sessão";
      this.loginBtn.nativeElement.onclick = () => {
        this.authService.logout();
        location.reload();
      }
    }
    else {
      this.loginBtn.nativeElement.innerHTML = "Entrar";
      this.loginBtn.nativeElement.onclick = () => {
        this.router.navigate(['/login']);
      }
    }
  }

  /**
 * Navega para a página de dashboard do utilizador.
 */
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);

  }

  /**
 * Navega para a página inicial (landing page).
 */
  navigateToLanding(): void {
    this.router.navigate(['/']);

  }

  /**
 * Navega para a página do marketplace onde os utilizadors podem visualizar e comprar créditos de carbono.
 */
  navigateToMarketPlace(): void {
    this.router.navigate(['/marketplace']);

  }
}
