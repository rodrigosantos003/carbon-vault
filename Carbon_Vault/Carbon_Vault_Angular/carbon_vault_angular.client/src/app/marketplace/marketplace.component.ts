import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';


@Component({
  selector: 'app-marketplace',
  standalone: false,
  
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})


export class MarketplaceComponent {
  @ViewChild('filterBtn', { static: true }) filterBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('loginBtn', { static: true }) loginBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('filterValue', { static: true }) filterValue!: ElementRef<HTMLSpanElement>;

  projetos: any[] = [
    {
      title: 'Produto Exemplo',
      description: 'Este é um produto de exemplo com descrição curta.',
      imageUrl: '/images/marketplace card example.png',  // Coloca o caminho da imagem
      price: '20.00',
      quantity: 1
    },
    {
      title: 'Outro Produto Exemplo',
      description: 'Descrição de outro produto de exemplo.',
      imageUrl: '/images/marketplace card example.png',
      price: '35.00',
      quantity: 2
    }
  ];

  isFiltersWindowVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) {

  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
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

  changeFiltersWindowState(): void {
    this.isFiltersWindowVisible = !this.isFiltersWindowVisible;
  }

  changeFilterOption(event: any): void {
    const filterOption = event.target;
    const value = filterOption.getAttribute('data-value');

    this.filterValue.nativeElement.textContent = value;

    this.isFiltersWindowVisible = false;

    switch (value) {
      case 'Preço Asc':
        this.projetos.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;

      case 'Preço Desc':
        this.projetos.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;

      case 'Alfabetica Asc':
        this.projetos.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case 'Alfabetica Desc':
        this.projetos.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
  }
}
