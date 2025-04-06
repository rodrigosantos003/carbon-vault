import { Component, Input } from '@angular/core';
import { CartService } from '../cart.service';
import { AlertsService } from '../alerts.service'
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
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
 * Obtém a quantidade de créditos de carbono disponíveis para venda de um projeto.
 * 
 * @param projectId ID do projeto.
 * @returns Um Observable que emite os dados do projeto, incluindo a quantidade de créditos de carbono disponíveis.
 */
  getProjectQuantityForSale(projectId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/projects/${projectId}`).pipe(
      tap((data) => {
        console.log(data);
        this.projectData = data;
        this.carbonCreditsForSale = this.projectData.creditsForSale;
      })
    );
  }

  /**
 * Adiciona o item ao carrinho, validando se há créditos suficientes disponíveis para o projeto.
 * - Verifica se o número de créditos disponíveis é suficiente para a quantidade solicitada.
 * - Mostra um alerta de erro caso não haja créditos suficientes ou o projeto não tenha créditos disponíveis.
 * - Se a validação for bem-sucedida, o item é adicionado ao carrinho e o utilizador recebe um alerta de sucesso.
 */
  addToCart() {
    this.getProjectQuantityForSale(this.projectID).subscribe({
      next: () => {
        console.log("Creditos = " + this.carbonCreditsForSale);
        ; if (this.carbonCreditsForSale < 1) {
          this.alerts.enableError("Este projeto não tem créditos disponveis para venda, tente mais tarde.", 5);
          return;
        }

        if (this.carbonCreditsForSale < this.quantity) {
          this.alerts.enableError("Quantidade máxima de " + this.carbonCreditsForSale + " CC para este projeto", 5);
          return;
        }

        if (this.projectData.owner != this.authService.getUserId()) {
          this.alerts.enableError("Não pode comprar créditos do seu próprio projeto", 5);
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

        this.quantity = 1;
      },
      error: (e) => {
        console.error("Erro na requisição:", e);
      }
    });
  }
}
