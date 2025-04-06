import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized-page',
  standalone: false,

  templateUrl: './unauthorized-page.component.html',
  styleUrl: './unauthorized-page.component.css'
})
export class UnauthorizedPageComponent {

  /**
   * Construtor do componente.
   *
   * @param router Serviço de navegação do Angular para redirecionar o utilizador.
   */
  constructor(private router: Router) { }

  /**
   * Redireciona o utilizador para a página principal (dashboard) ao clicar no botão.
   */
  goToHome() {
    this.router.navigate(['/dashboard']);
  }
}
