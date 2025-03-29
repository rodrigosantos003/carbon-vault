import { Component, Input } from '@angular/core';
import { CartService } from '../cart.service';
import { AlertsService } from '../alerts.service'

@Component({
  selector: 'app-projectCard',
  templateUrl: './projectCard.component.html',
  styleUrls: ['./projectCard.component.css'],
  standalone: false,
})
export class ProjectCardComponent {
  @Input() imageUrl!: string;
  @Input() name!: string;
  @Input() description!: string;
  @Input() pricePerCredit!: number;
  @Input() projectID!: number;
  @Input() quantity: number = 1; // Valor padrão de 1

  constructor(private cartService: CartService, private alerts: AlertsService) { }

  ngOnInit() {
    this.quantity = 1;
  }

  validateQuantity() {
    if (this.quantity < 1 || isNaN(this.quantity)) {
      this.quantity = 1;
    }
  }

  addToCart() {
    if (this.quantity < 1) {
      this.alerts.enableError("A quantidade mínima é 1.");
      return;
    }

    const item = {
      id: this.projectID,
      image: this.imageUrl,
      name: this.name,
      description: this.description,
      price: this.pricePerCredit,
      quantity: this.quantity,
    };

    this.cartService.addItem(item);
    this.alerts.enableSuccess("Item adicionado ao carrinho!");

    this.quantity = 1;
  }
}
