import { Component } from '@angular/core';
import { AuthService } from '../auth-service.service';

@Component({
  selector: 'app-admin-menu',
  standalone: false,

  templateUrl: './admin-menu.component.html',
  styleUrl: './admin-menu.component.css'
})
export class AdminMenuComponent {

  /**
   * Responsável por injetar o serviço de autenticação.
   * 
   * @param authService Serviço de autenticação utilizado para encerrar a sessão do utilizador.
   */
  constructor(private authService: AuthService) { }

  /**
 * Termina a sessão do utilizador autenticado, ao chamar o método `logout()` do `AuthService`.
 */
  onLogout() {
    this.authService.logout();
  }
}
