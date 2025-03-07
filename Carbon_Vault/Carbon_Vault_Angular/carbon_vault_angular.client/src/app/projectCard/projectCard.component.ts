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
  @Input() pricePerCredit!: number;
  @Input() projectID!: number;
  @Input() quantity: number = 1; // Valor padrão de 1

  constructor(private cartService: CartService, private alerts: AlertsService) {}

  ngOnInit() {
    this.quantity = 1;
  }

  addToCart() {
    const item = {
      id: this.projectID,
      image: this.imageUrl,
      name: this.name,
      price: this.pricePerCredit,
      quantity: this.quantity,
    };

    this.cartService.addItem(item);

    this.alerts.enableSuccess("Item adicionado ao carrinho!");
    //alert('Item adicionado ao carrinho!');
    setTimeout(() => {
      this.alerts.disableSuccess();
    }, 3000);

    this.quantity = 1;
  }
}
