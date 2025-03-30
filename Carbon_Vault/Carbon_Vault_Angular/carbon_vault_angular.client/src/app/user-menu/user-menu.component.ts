

import { Component, Input } from '@angular/core';
import { AuthService } from '../auth-service.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-menu',
  standalone: false,

  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css'
})
export class UserMenuComponent {
  userRole: number = 0;
  userId: string;
  userName: string;
  userInitial: string;



  adminMenu = [
    { icon: 'images/menu/DashboardIcon.png', label: 'Dashboard', route: '/dashboard' },
    { icon: 'images/menu/UserIconB.png', label: 'Gestão de Utilizadores', route: '/users-manager' },
    { icon: 'images/menu/PurchasesIcon.png', label: 'Gestão de Compras', route: '/admin-transactions' },
    { icon: 'images/menu/ProjectsIcon.png', label: 'Gestão de Projetos', route: '/project-manager' },
    { icon: 'images/menu/RelatoriosIcon.png', label: 'Relatórios', route: '/dashboard' },
    { icon: 'images/menu/TicketsIcon.png', label: 'Tickets', route: '/support-manager' },
    { icon: 'images/menu/MarketplaceIcon.png', label: 'Marketplace', route: '/marketplace' },
    { icon: 'images/menu/SettingsIcon.png', label: 'Definições', route: '/settings' },
  ];

  userMenu = [
    { icon: 'images/menu/DashboardIcon.png', label: 'Dashboard', route: '/dashboard' },
    { icon: 'images/menu/EmissionsIcon.png', label: 'As minhas Emissões', route: '/user-emissions' },
    { icon: 'images/menu/ProjectsIcon.png', label: 'Os meus Projetos', route: '/Account-project-manager' },
    { icon: 'images/menu/PurchasesIcon.png', label: 'As minhas Compras', route: '/purchases' },
    { icon: 'images/menu/SalesIcon.png', label: 'As minhas Vendas', route: '/sales' },
    { icon: 'images/menu/RelatoriosIcon.png', label: 'Relatórios', route: '/dashboard' },
    { icon: 'images/menu/MarketplaceIcon.png', label: 'Marketplace', route: '/marketplace' },
    { icon: 'images/menu/TicketsIcon.png', label: 'Tickets', route: '/user-support' },
    { icon: 'images/menu/SettingsIcon.png', label: 'Definições', route: '/settings' },
  ];

  constructor(private authService: AuthService, private http: HttpClient) {

    this.userId = this.authService.getUserId();
    this.userInitial = ''
    this.userName = ''
  
  }

  ngOnInit() {
    const url = `${environment.apiUrl}/accounts/${this.userId}`;

    this.http.get(url).subscribe(
      (data: any) => {
        // Se a requisição for bem-sucedida, preenche o formulário com os dados recebidos
        this.userName = data.name
        this.userInitial = data.name[0],
        this.userRole = data.role
       
      },
      error => {
        // Caso contrário, exibe o erro no console
        console.error("Erro na requisição:", error);

      }
    );

  }

 

  onLogout() {
    this.authService.logout();
  }
}

