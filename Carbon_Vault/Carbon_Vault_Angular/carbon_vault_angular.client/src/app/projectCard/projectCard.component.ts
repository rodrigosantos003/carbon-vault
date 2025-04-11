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
  @Input() creditsAvailable!: number;
  projectData: any = null;

  /**
 * Construtor do componente `ProjectCardComponent`.
 * Inicializa o componente com os serviços necessários para manipulação do carrinho, de alertas e requisições HTTP.
 * 
 * @param cartService Serviço de manipulação do carrinho de compras.
 * @param alerts Serviço de alertas.
 * @param http Serviço para realizar requisições HTTP.
 * @param authService Serviço para verificar se o utilizador está autenticado.
 */
  constructor(private cartService: CartService, private alerts: AlertsService, private http: HttpClient, private authService: AuthService) { }

  /**
 * Método chamado na inicialização do componente.
 * - Define o valor padrão da quantidade como 1.
 */
  ngOnInit() {
    this.quantity = 1;
  }

  /**
 * Valida a quantidade de créditos de carbono que o utilizador deseja adicionar ao carrinho.
 * - Se a quantidade for menor que 1 ou não for um número válido, o valor é redefinido para 1.
 */
  validateQuantity() {
    if (this.quantity < 1 || isNaN(this.quantity)) {
      this.quantity = 1;
    }
  }

  /**
 * Adiciona o item ao carrinho, validando se há créditos suficientes disponíveis para o projeto.
 */
  addToCart() {
    const quantityInCart = this.cartService.getProdQuantity(this.projectID);
    const newQuantity = quantityInCart + this.quantity;
    console.log(newQuantity);

    if (newQuantity <= this.creditsAvailable) {
      console.log("Stock: " + this.creditsAvailable + ", quant: " + this.quantity + ", current cart quant: ");
      this.cartService.addItem(this.projectID, this.quantity);
      this.quantity = 1;
    } else {
      const quantLeft = this.creditsAvailable - quantityInCart;
      this.alerts.enableError("Não existe stock suficiente para essa quantidade (" + this.quantity + "), insira uma quantidade até (" + quantLeft + ") ou tente mais tarde.", 6);
    }
  }
}
