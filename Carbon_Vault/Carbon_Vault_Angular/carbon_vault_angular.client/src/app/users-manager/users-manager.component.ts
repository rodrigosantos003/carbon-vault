import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
