import { Component, Input } from '@angular/core';
import { CartService } from '../cart.service';
import { AlertsService } from '../alerts.service'
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

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

  constructor(private cartService: CartService, private alerts: AlertsService, private http: HttpClient) { }

  ngOnInit() {
    this.quantity = 1;
  }

  validateQuantity() {
    if (this.quantity < 1 || isNaN(this.quantity)) {
      this.quantity = 1;
    }
  }

  getProjectQuantityForSale(projectId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/projects/${projectId}`).pipe(
      tap((data) => {
        this.projectData = data;
        this.carbonCreditsForSale = this.projectData.creditsForSale;
      })
    );
  }

  addToCart() {
    this.getProjectQuantityForSale(this.projectID).subscribe({
      next: () => {
        console.log("Creditos = " + this.carbonCreditsForSale);
;        if (this.carbonCreditsForSale < 1) {
          this.alerts.enableError("Este projeto não tem créditos disponveis para venda, tente mais tarde.", 5);
          return;
        }

        if (this.carbonCreditsForSale < this.quantity) {
          this.alerts.enableError("Quantidade máxima de " + this.carbonCreditsForSale + " CC para este projeto", 5);
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
      },
      error: (e) => {
        console.error("Erro na requisição:", e);
      }
    });
  }

}
