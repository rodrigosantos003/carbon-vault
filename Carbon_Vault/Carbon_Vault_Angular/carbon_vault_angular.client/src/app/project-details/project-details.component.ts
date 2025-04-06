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

  constructor(private route: ActivatedRoute, private http: HttpClient, private authService: AuthService, private router: Router, private alerts: AlertsService, private cartService: CartService) { }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.http.get(`${environment.apiUrl}/projects/${this.projectId}`).subscribe((data: any) => {
      this.projectData = data;
      this.carbonCredits = this.projectData.carbonCredits || [];
    }, error => {
      console.error("Erro na requisição:", error);
    });
  }

  getCreditSaleStatus(credit: any): boolean {
    return this.projectData.carbonCredits.indexOf(credit) < this.projectData.creditsForSale;
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

  validateQuantity() {
    if (this.quantity < 1 || isNaN(this.quantity)) {
      this.quantity = 1;
    }
  }

  addToCart(): void {
    this.cartService.addItem(parseInt(this.projectId), this.quantity);
    this.quantity = 1;
  }
  

  // PAGE SYSTEM
  getFilteredCredits(): any[] {
    return this.projectData.carbonCredits.filter((any: any) => this.getCreditSaleStatus(any));
  }

  getPagedCredits(): any[] {
    const filtered = this.getFilteredCredits();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.getFilteredCredits().length / this.itemsPerPage);
  }

  changePage(step: number): void {
    const totalPages = this.getTotalPages();
    this.currentPage = Math.min(Math.max(1, this.currentPage + step), totalPages);
  }
}
