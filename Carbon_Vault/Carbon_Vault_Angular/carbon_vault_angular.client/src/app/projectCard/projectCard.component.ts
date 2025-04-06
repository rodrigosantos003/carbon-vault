import { Component, Input } from '@angular/core';
import { CartService } from '../cart.service';
import { AlertsService } from '../alerts.service'
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-service.service';

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
  projectData: any = null;
  carbonCreditsForSale: number = 0;

  constructor(private cartService: CartService, private alerts: AlertsService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.quantity = 1;
  }

  validateQuantity() {
    if (this.quantity < 1 || isNaN(this.quantity)) {
      this.quantity = 1;
    }
  }

  addToCart() {
    this.cartService.addItem(this.projectID, this.quantity);
    this.quantity = 1;
  }

}
