import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-projectCard',
  standalone: false,
  templateUrl: './projectCard.component.html',
  styleUrl: './projectCard.component.css'
})
export class ProjectCardComponent {
  @Input() name: string = '';         // Título do projeto
  @Input() imageUrl: string = '';      // URL da imagem do projeto
  @Input() pricePerCredit: string = '';         // Preço do projeto
  @Input() quantity: number = 1;       // Quantidade inicial
  @Input() projectID: number = 1;       // Quantidade inicial
}
