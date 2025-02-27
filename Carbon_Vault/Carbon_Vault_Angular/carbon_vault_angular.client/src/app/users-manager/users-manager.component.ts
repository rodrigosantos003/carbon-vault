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
  private userAccountsURL = 'https://localhost:7117/api/Accounts/users';
  private selectedAccountId: number | null = null;
  private apiURL = 'https://localhost:7117/api/Accounts';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getAccounts();
    console.log(this.accounts);
  }

  openPopup(account_id: number) {
    this.selectedAccountId = account_id;
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  closePopup() {
    this.selectedAccountId = null;
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
    this.http.get<any[]>(this.userAccountsURL).subscribe({
      next: (data) => {
        this.accounts = data; // Armazena os dados da API no array
      },
      error: (error) => {
        console.error('Erro ao encontrar as contas:', error);
      }
    });
  }

  deleteAccount() {
    if (this.selectedAccountId !== null) {
      const deleteURL = `${this.apiURL}/${this.selectedAccountId}`;
      console.log("ID da conta a eliminar: " + this.selectedAccountId);

      this.http.delete(deleteURL).subscribe(() => {
        this.accounts = this.accounts.filter(acc => acc.id !== this.selectedAccountId);
        this.closePopup();
      }, error => {
        console.error("Erro ao eliminar conta:", error);
      });
    } else {
      console.log("ID é null");
    }
  }
}
