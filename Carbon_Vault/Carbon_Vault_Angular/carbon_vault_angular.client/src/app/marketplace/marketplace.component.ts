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
    this.http.get(`${environment.apiUrl}/projects`).subscribe((data: any) => {
      this.allProjects = data;
      this.projectsToShow = this.allProjects;
    }, error => {
      console.error("Erro na requisição:", error);
    });
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

  changeSearchValue(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.projectsToShow = this.allProjects.filter((project) => {
      return project.name.toLowerCase().includes(searchValue);
    });
  }
}
