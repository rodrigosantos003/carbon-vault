import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-not-found-page',
  standalone: false,

  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.css'
})
export class NotFoundPageComponent {

  /**
 * Injeta o serviço de roteamento (`Router`) para permitir a navegação programática.
 */
  constructor(private router: Router) { }

  /**
 * Método que navega para a página do dashboard quando o utilizador clica para voltar à página inicial.
 * O método é acionado, por exemplo, através de um botão na página de erro 404.
 */
  goToHome() {
    this.router.navigate(['/dashboard']);
  }
}
