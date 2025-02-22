import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfirmAccountComponent } from '../confirm-account/confirm-account.component';

@Component({
  selector: 'app-users-manager',
  standalone: false,
  
  templateUrl: './users-manager.component.html',
  styleUrl: './users-manager.component.css'
})
export class UsersManagerComponent {
  accounts: any[] = [];
  private uuserAccountsURL = 'https://localhost:7117/api/Accounts/users';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getAccounts();
    console.log(this.accounts);
  }

  openPopup() {
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

  viewAccount(account: any) {
    console.log(account.id);
  }

  getAccounts(): void {
    this.http.get<any[]>(this.uuserAccountsURL).subscribe({
      next: (data) => {
        this.accounts = data; // Armazena os dados da API no array
      },
      error: (error) => {
        console.error('Erro ao encontrar as contas:', error);
      }
    });
  }
}
