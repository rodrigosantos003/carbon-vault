import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-go-back-button',
  standalone: false,

  templateUrl: './go-back-button.component.html',
  styleUrl: './go-back-button.component.css'
})
export class GoBackButtonComponent {
  constructor(private location: Location) { }

  /**
 * Método que aciona a navegação para a página anterior, utilizando o serviço `Location` para voltar no histórico.
 */
  goBack(): void {
    this.location.back();
  }
}
