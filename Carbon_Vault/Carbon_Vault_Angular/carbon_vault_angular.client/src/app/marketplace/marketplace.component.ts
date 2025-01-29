import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';


@Component({
  selector: 'app-marketplace',
  standalone: false,
  
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})


export class MarketplaceComponent implements OnInit{
  @ViewChild('filterBtn', { static: true }) filterBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('loginBtn', { static: true }) loginBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('filterValue', { static: true }) filterValue!: ElementRef<HTMLSpanElement>;

  allProjects: any[] = [];

  projectsToShow: any[] = [];

  isFiltersWindowVisible: boolean = false;
  isUserLoggedIn: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) {
  }

  ngOnInit(): void {
    this.changeLoginBtnText();
    this.http.get('http://localhost:7117/api/projects').subscribe((data: any) => {
      this.allProjects = data;
      this.projectsToShow = this.allProjects;
    }, error => {
      console.error("Erro na requisição:", error);
    });
  }

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
        this.projectsToShow.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;

      case 'Preço Desc':
        this.projectsToShow.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;

      case 'Alfabetica Asc':
        this.projectsToShow.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case 'Alfabetica Desc':
        this.projectsToShow.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
  }

  changeSearchValue(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.projectsToShow = this.allProjects.filter((project) => {
      return project.name.toLowerCase().includes(searchValue);
    });
  }
}
