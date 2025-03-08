import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router,ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { AlertsService } from '../services/alerts.service';
@Component({
  selector: 'app-user-details',
  standalone: false,
  
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {
  accountId: string | null = null;
  accountData: any = null;
  private apiURL = 'https://localhost:7117/api/Accounts';


  constructor(private route: ActivatedRoute,  private http: HttpClient,     private authService: AuthService ,    private router: Router ,private alerts: AlertsService ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id');
    this.http.get(`https://localhost:7117/api/Accounts/${this.accountId}`).subscribe((data: any) => {
      this.accountData = data;
      console.log(this.accountData)
    }, error => {
      console.error("Erro na requisição:", error);
    });
  }


  openDeletePopup() {
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  closePopup() {
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }



  deleteAccount() {
    if (this.accountId) {
      const deleteURL = `${this.apiURL}/${this.accountId}`;
      const jwtToken = localStorage.getItem('token');
      const userIdFromToken = this.authService.getUserId();

     
      if (userIdFromToken == this.accountId) {
        alert("Não pode Eliminar a sua própria conta");
        return;
      }

      if (jwtToken) {
        this.http.delete(deleteURL, {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        }).subscribe(
          () => {
            this.router.navigate(['/users-manager']); 
            this.closePopup();  
          },
          error => {
            console.error("Error deleting account:", error);
            alert('Error deleting the account.');
          }
        );
      } else {
        console.error("JWT token not found");
      }
    } else {
      console.log("Account ID is null");
    }
  }

}
