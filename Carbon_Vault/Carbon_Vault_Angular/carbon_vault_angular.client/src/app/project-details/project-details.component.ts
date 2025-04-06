import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { environment } from '../../environments/environment';
import { AlertsService } from '../alerts.service';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-project-details',
  standalone: false,

  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css'
})
export class ProjectDetailsComponent {
  @ViewChild('loginBtn', { static: true }) loginBtn!: ElementRef<HTMLButtonElement>;
  isFiltersWindowVisible: boolean = false;
  isUserLoggedIn: boolean = false;
  projectId: any = "";
  projectData: any = null
  quantity: number = 1;
  carbonCredits: any[] = [];

  showMetadata: boolean = false;
  currentPage = 1;
  itemsPerPage = 10;

  /**
 * Construtor do componente `ProjectDetailsComponent`.
 * Inicializa o componente com os serviços necessários para mostrar os detalhes do projeto, controlar o carrinho e fazer a gestão do login.
 * 
 * @param route Serviço para aceder os parâmetros da rota ativa.
 * @param http Serviço para realizar requisições HTTP.
 * @param authService Serviço para autenticação e gestão de sessão do utilizador.
 * @param router Serviço para navegação entre as páginas.
 * @param alerts Serviço de alertas.
 * @param cartService Serviço para manipulação do carrinho de compras.
 */
  constructor(private route: ActivatedRoute, private http: HttpClient, private authService: AuthService, private router: Router, private alerts: AlertsService, private cartService: CartService) { }

  /**
 * Método chamado na inicialização do componente.
 * - Recupera o ID do projeto a partir da rota.
 * - Faz uma requisição HTTP para obter os detalhes do projeto com base no ID.
 */
  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.http.get(`${environment.apiUrl}/projects/${this.projectId}`).subscribe((data: any) => {
      this.projectData = data;
      this.carbonCredits = this.projectData.carbonCredits || [];
    }, error => {
      console.error("Erro na requisição:", error);
    });
  }

  /**
 * Verifica se o crédito de carbono está disponível para venda.
 * 
 * @param credit O crédito de carbono a ser verificado.
 * @returns Um valor booleano que indica se o crédito está disponível para venda.
 */
  getCreditSaleStatus(credit: any): boolean {
    return this.projectData.carbonCredits.indexOf(credit) < this.projectData.creditsForSale;
  }

  /**
 * Altera o texto e a ação do botão de login com base no estado de autenticação do utilizador.
 * - Se o utilizador estiver autenticado, o botão mostra "Terminar Sessão" e realiza o logout ao ser clicado.
 * - Se o utilizador não estiver autenticado, o botão mostra "Entrar" e redireciona para a página de login.
 */
  changeLoginBtnText(): void {
    this.isUserLoggedIn = this.authService.isAuthenticated();
    if (this.isUserLoggedIn) {

      this.loginBtn.nativeElement.innerHTML = "Terminar Sessão";
      this.loginBtn.nativeElement.onclick = () => {
        this.authService.logout();
        this.router.navigate(['/']);
      }
    }
    else {
      this.loginBtn.nativeElement.innerHTML = "Entrar";
      this.loginBtn.nativeElement.onclick = () => {
        this.router.navigate(['/login']);
      }
    }
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
 * - Verifica se o número de créditos disponíveis é suficiente para a quantidade solicitada.
 * - Mostra um alerta de erro caso não haja créditos suficientes ou o projeto não tenha créditos disponíveis.
 * - Se a validação for bem-sucedida, o item é adicionado ao carrinho e o utilizador recebe um alerta de sucesso.
 */
  addToCart() {
    console.log("CC = " + this.projectData.creditsForSale);
    console.log("Quant = " + this.quantity);
    if (this.projectData.creditsForSale < 1) {
      this.alerts.enableError("Este projeto não tem créditos disponveis para venda, tente mais tarde.", 5);
      return;
    }

    if (this.projectData.creditsForSale < this.quantity) {
      this.alerts.enableError("Quantidade máxima de " + this.projectData.creditsForSale + " CC para este projeto", 5);
      return;
    }

    const item = {
      id: parseInt(this.projectId),
      image: this.projectData.imageUrl,
      name: this.projectData.name,
      description: this.projectData.description,
      price: this.projectData.pricePerCredit,
      quantity: this.quantity,
    };

    this.cartService.addItem(item);
    this.alerts.enableSuccess("Item adicionado ao carrinho!");

    this.quantity = 1;
  }

  // ### PAGE SYSTEM ###

  /**
 * Filtra os créditos de carbono disponíveis para venda de acordo com o status de venda.
 * 
 * @returns Um array de créditos filtrados disponíveis para venda.
 */
  getFilteredCredits(): any[] {
    return this.projectData.carbonCredits.filter((any: any) => this.getCreditSaleStatus(any));
  }

  /**
 * Obtém os créditos de carbono filtrados e paginados.
 * 
 * @returns Um array de créditos de carbono para a página atual.
 */
  getPagedCredits(): any[] {
    const filtered = this.getFilteredCredits();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
 * Calcula o número total de páginas para mostrar os créditos de carbono paginados.
 * 
 * @returns O número total de páginas.
 */
  getTotalPages(): number {
    return Math.ceil(this.getFilteredCredits().length / this.itemsPerPage);
  }

  /**
 * Altera a página dos créditos de carbono.
 * - O parâmetro `step` pode ser negativo (para retroceder) ou positivo (para avançar).
 * - A navegação entre páginas é limitada ao número total de páginas.
 * 
 * @param step O número de passos para avançar ou retroceder na navegação de páginas.
 */
  changePage(step: number): void {
    const totalPages = this.getTotalPages();
    this.currentPage = Math.min(Math.max(1, this.currentPage + step), totalPages);
  }
}
