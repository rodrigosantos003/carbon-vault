import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-marketplace',
  standalone: false,
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})


export class MarketplaceComponent implements OnInit {
  @ViewChild('filterBtn', { static: true }) filterBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('loginBtn', { static: true }) loginBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('filterValue', { static: true }) filterValue!: ElementRef<HTMLSpanElement>;

  allProjects: any[] = [];

  projectsToShow: any[] = [];
  backendUrl: string = environment.apiUrl
  isFiltersWindowVisible: boolean = false;
  isUserLoggedIn: boolean = false;

  /**
 * Injeta os serviços necessários para o funcionamento do componente:
 * - `HttpClient`: Para fazer requisições à API.
 * - `Router`: Para navegação entre páginas.
 * - `AuthService`: Para verificar se o utilizador está autenticado.
 */
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) {
  }

  /**
 * Realiza a requisição para obter todos os projetos disponíveis para venda no marketplace.
 */
  ngOnInit(): void {
    this.http.get(`${environment.apiUrl}/projects/forSale`).subscribe({
      next: (data: any) => {
        this.allProjects = data;
        this.projectsToShow = this.allProjects;
      }
    });
  }

  /**
  * Altera o estado da janela de filtros (visível ou invisível).
  */
  changeFiltersWindowState(): void {
    this.isFiltersWindowVisible = !this.isFiltersWindowVisible;
  }

  /**
  * Aplica o filtro selecionado e organiza a lista de projetos com base no valor do filtro.
  * Os filtros podem ser:
  * - Preço Ascendente
  * - Preço Descendente
  * - Ordem Alfabética Ascendente
  * - Ordem Alfabética Descendente
  * 
  * @param {any} event - O evento que contém a opção de filtro selecionada.
  */
  changeFilterOption(event: any): void {
    const filterOption = event.target;
    const value = filterOption.getAttribute('data-value');

    this.filterValue.nativeElement.textContent = value;

    this.isFiltersWindowVisible = false;

    switch (value) {
      case 'Preço Asc':
        this.projectsToShow.sort((a, b) => parseFloat(a.pricePerCredit) - parseFloat(b.pricePerCredit));
        break;

      case 'Preço Desc':
        this.projectsToShow.sort((a, b) => parseFloat(b.pricePerCredit) - parseFloat(a.pricePerCredit));
        break;

      case 'Alfabetica Asc':
        this.projectsToShow.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'Alfabetica Desc':
        this.projectsToShow.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
  }

  /**
  * Aplica o filtro de pesquisa nos projetos com base no nome.
  * Mostra apenas os projetos cujo nome contém o valor da pesquisa.
  * 
  * @param {any} event - O evento de alteração no campo de pesquisa.
  */
  changeSearchValue(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.projectsToShow = this.allProjects.filter((project) => {
      return project.name.toLowerCase().includes(searchValue);
    });
  }
}
