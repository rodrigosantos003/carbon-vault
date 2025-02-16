

import { Component } from '@angular/core';
import { AuthService } from '../auth-service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-menu',
  standalone: false,
  
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css'
})
export class UserMenuComponent {
  userId: string;
  userName : string;
  userInitial : string;


  constructor(private authService: AuthService, private http: HttpClient) {
    this.userId = this.authService.getUserId();
    this.userInitial = ''
    this.userName = ''
  }

  ngOnInit() {
    const url = `https://localhost:7117/api/accounts/${this.userId}`;

    this.http.get(url).subscribe(
      (data: any) => {
        // Se a requisição for bem-sucedida, preenche o formulário com os dados recebidos
        this.userName = data.name
        this.userInitial = data.name[0]
      },
      error => {
          // Caso contrário, exibe o erro no console
          console.error("Erro na requisição:", error);
        
      }
    );
  }
}
 
