import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-projectCard',
  standalone: false,
  
  templateUrl: './projectCard.component.html',
  styleUrl: './projectCard.component.css'
})
export class ProjectCardComponent {
  @Input() title: string = '';         // Título do projeto
  @Input() description: string = '';   // Descrição do projeto
  @Input() imageUrl: string = '';      // URL da imagem do projeto
  @Input() price: string = '';         // Preço do projeto
  @Input() quantity: number = 1;       // Quantidade inicial
}
