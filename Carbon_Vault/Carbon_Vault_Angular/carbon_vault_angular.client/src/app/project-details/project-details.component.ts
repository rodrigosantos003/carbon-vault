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
  projectId: string | null = null;
  projectData: any = null
  quantity: number = 1;
  carbonCredits: any[] = [];
  showMetadata: boolean = false;

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

  addToCart() {
    const item = {
      id: this.projectId,
      image: this.projectData.imageUrl,
      name: this.projectData.name,
      description: this.projectData.description,
      price: this.projectData.pricePerCredit,
      quantity: this.projectData.quantity,
    };

    this.cartService.addItem(item);

    this.alerts.enableSuccess("Item adicionado ao carrinho!");
    //alert('Item adicionado ao carrinho!');
    //setTimeout(() => {
    //  this.alerts.disableSuccess();
    //}, 3000);

    this.quantity = 1;
  }
}
