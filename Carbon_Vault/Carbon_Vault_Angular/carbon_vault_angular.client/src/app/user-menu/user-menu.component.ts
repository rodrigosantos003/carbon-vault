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

  /** Menu para utilizador com papel de admin. */
  adminMenu = [
    { icon: 'images/menu/DashboardIcon.png', label: 'Dashboard', route: '/dashboard' },
    { icon: 'images/menu/UserIconB.png', label: 'Gestão de Utilizadores', route: '/users-manager' },
    { icon: 'images/menu/PurchasesIcon.png', label: 'Gestão de Compras', route: '/admin-transactions' },
    { icon: 'images/menu/ProjectsIcon.png', label: 'Gestão de Projetos', route: '/project-manager' },
    { icon: 'images/menu/RelatoriosIcon.png', label: 'Relatórios', route: '/admin-reports' },
    { icon: 'images/menu/TicketsIcon.png', label: 'Tickets', route: '/support-manager' },
    { icon: 'images/menu/MarketplaceIcon.png', label: 'Marketplace', route: '/marketplace' },
    { icon: 'images/menu/SettingsIcon.png', label: 'Definições', route: '/settings' },
  ];

  /** Menu para utilizador com papel de suporte. */
  supportMenu = [
    { icon: 'images/menu/DashboardIcon.png', label: 'Dashboard', route: '/dashboard' },
    { icon: 'images/menu/TicketsIcon.png', label: 'Tickets', route: '/support-manager' },
    { icon: 'images/menu/SettingsIcon.png', label: 'Definições', route: '/settings' },
  ];

  /** Menu para utilizador com papel de avaliador. */
  EvaluatorMenu = [
    { icon: 'images/menu/DashboardIcon.png', label: 'Dashboard', route: '/dashboard' },
    { icon: 'images/menu/SettingsIcon.png', label: 'Definições', route: '/settings' },
  ];

  /** Menu para utilizador comum. */
  userMenu = [
    { icon: 'images/menu/DashboardIcon.png', label: 'Dashboard', route: '/dashboard' },
    { icon: 'images/menu/EmissionsIcon.png', label: 'As minhas Emissões', route: '/user-emissions' },
    { icon: 'images/menu/ProjectsIcon.png', label: 'Os meus Projetos', route: '/Account-project-manager' },
    { icon: 'images/menu/PurchasesIcon.png', label: 'As minhas Compras', route: '/purchases' },
    { icon: 'images/menu/SalesIcon.png', label: 'As minhas Vendas', route: '/sales' },
    { icon: 'images/menu/RelatoriosIcon.png', label: 'Relatórios', route: '/user-reports' },
    { icon: 'images/menu/MarketplaceIcon.png', label: 'Marketplace', route: '/marketplace' },
    { icon: 'images/menu/TicketsIcon.png', label: 'Tickets', route: '/user-support' },
    { icon: 'images/menu/SettingsIcon.png', label: 'Definições', route: '/settings' },
  ];

  /**
   * Construtor do componente.
   *
   * @param authService Serviço de autenticação para obter os dados do utilizador.
   * @param http Serviço HTTP para comunicação com a API.
   */
  constructor(private authService: AuthService, private http: HttpClient) {

    this.userId = this.authService.getUserId();
    this.userInitial = ''
    this.userName = ''

  }

  /**
   * Ciclo de vida do componente após inicialização.
   * Recupera os dados do utilizador da API e atualiza as variáveis `userName`, `userInitial` e `userRole`.
   */
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

  /**
   * Método para realizar o logout do utilizador.
   * Chama o método `logout` do serviço de autenticação.
   */
  onLogout() {
    this.authService.logout();
  }
}
