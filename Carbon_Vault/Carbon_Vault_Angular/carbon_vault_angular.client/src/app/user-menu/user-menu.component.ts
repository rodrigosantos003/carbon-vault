

import { Component, Input } from '@angular/core';
import { AuthService } from '../auth-service.service';
import { HttpClient } from '@angular/common/http';

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
    { icon: 'images/menu/DashboardIcon.png', label: 'Dashboard', route: '/admin-dashboard' },
    { icon: 'images/menu/UserIconB.png', label: 'Gestão de Utilizadores', route: '/users-manager' },
    { icon: 'images/menu/PurchasesIcon.png', label: 'Gestão de Compras', route: '/admin-dashboard' },
    { icon: 'images/menu/ProjectsIcon.png', label: 'Gestão de Projetos', route: '/admin-dashboard' },
    { icon: 'images/menu/RelatoriosIcon.png', label: 'Relatórios', route: '/admin-dashboard' },
    { icon: 'images/menu/TicketsIcon.png', label: 'Tickets', route: '/admin-dashboard' },
    { icon: 'images/menu/MarketplaceIcon.png', label: 'Marketplace', route: '/admin-dashboard' },
    { icon: 'images/menu/SettingsIcon.png', label: 'Definições', route: '/admin-dashboard' },
  ];

  userMenu = [
    { icon: 'images/menu/DashboardIcon.png', label: 'Dashboard', route: '/dashboard' },
    { icon: 'images/menu/EmissionsIcon.png', label: 'As minhas Emissões', route: '/user-emissions' },
    { icon: 'images/menu/ProjectsIcon.png', label: 'Os meus Projetos', route: '/dashboard' },
    { icon: 'images/menu/PurchasesIcon.png', label: 'As minhas Compras', route: '/purchases' },
    { icon: 'images/menu/SalesIcon.png', label: 'As minhas Vendas', route: '/sales' },
    { icon: 'images/menu/RelatoriosIcon.png', label: 'Relatórios', route: '/dashboard' },
    { icon: 'images/menu/MarketplaceIcon.png', label: 'Marketplace', route: '/marketplace' },
    { icon: 'images/menu/SettingsIcon.png', label: 'Definições', route: '/dashboard' },
  ];

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
        this.userInitial = data.name[0],
          this.userRole = data.role
        console.log(data)
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

