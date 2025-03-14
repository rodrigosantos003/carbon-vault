
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-market-place-navigation',
  standalone: false,
  
  templateUrl: './market-place-navigation.component.html',
  styleUrl: './market-place-navigation.component.css'
})
export class MarketPlaceNavigationComponent {
  @ViewChild('loginBtn', { static: true }) loginBtn!: ElementRef<HTMLButtonElement>;
  isUserLoggedIn: boolean = false;
  
  userId: string;
  userInitial : string;
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ){    
    this.userInitial = ''
    this.userId = this.authService.getUserId();
  }
  ngOnInit(): void {
    const url = `${environment.apiUrl}/accounts/${this.userId}`;

    this.http.get(url).subscribe(
      (data: any) => {
        // Se a requisição for bem-sucedida, preenche o formulário com os dados recebidos
       
        this.userInitial = data.name[0]
      },
      error => {
          // Caso contrário, exibe o erro no console
          console.error("Erro na requisição:", error);
        
      }
    );
    this.changeLoginBtnText();
    
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
  navigateToDashboard():void{
    this.router.navigate(['/dashboard']); 

  }
  navigateToLanding():void{
    this.router.navigate(['/']); 

  }
  navigateToMarketPlace():void{
    this.router.navigate(['/marketplace']); 

  }
}
