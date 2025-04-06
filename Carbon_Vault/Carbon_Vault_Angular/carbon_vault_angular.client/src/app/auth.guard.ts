import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth-service.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  /**
   * Construtor que injeta os serviços necessários para verificação e navegação.
   * 
   * @param {AuthService} authService - Serviço responsável pela autenticação do utilizador.
   * @param {Router} router - Serviço de navegação do Angular.
   */
  constructor(private authService: AuthService, private router: Router) { }

  /**
   * Método chamado automaticamente pelo Angular para determinar se a rota pode ser ativada.
   * Se o utilizador estiver autenticado, o acesso é permitido.
   * Caso contrário, o utilizador é redirecionado para a página de login.
   * 
   * @param {ActivatedRouteSnapshot} route - Informação sobre a rota que está a ser acedida.
   * @param {RouterStateSnapshot} state - Estado da árvore de rotas no momento do acesso.
   * @returns {boolean} - `true` se o acesso for permitido, `false` caso contrário.
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
