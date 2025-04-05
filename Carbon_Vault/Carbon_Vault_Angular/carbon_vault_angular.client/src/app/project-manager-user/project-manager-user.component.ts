import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-project-manager-user',
  standalone: false,

  templateUrl: './project-manager-user.component.html',
  styleUrl: './project-manager-user.component.css'
})
export class ProjectManagerUserComponent {
  projects: any[] = [];
  UserId: string = '';
  selectedProjectId: any;

  /**
   * Construtor do componente.
   * 
   * @param http Serviço HTTP para chamadas à API.
   * @param alerts Serviço de alertas para mensagens de sucesso ou erro.
   * @param authService Serviço de autenticação, utilizado para obter o ID do utilizador e headers.
   * @param router Serviço de navegação.
   */
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) {
    this.UserId = this.authService.getUserId()
  }

  /**
   * Inicializa o componente e carrega os projetos do utilizador.
   */
  ngOnInit(): void {
    this.getProjects(parseInt(this.UserId));
  }

  /**
   * Obtém todos os projetos do utilizador autenticado.
   * 
   * @param id ID do utilizador.
   */
  getProjects(id: number): void {
    this.alerts.enableLoading("A carregar Projetos..");
    this.http.get<any[]>(`${environment.apiUrl}/Projects/user/${id}`).subscribe({
      next: (data) => {
        this.projects = data;
        this.alerts.disableLoading();
      },
      error: (error) => {
        this.alerts.disableLoading();
        this.alerts.enableError("Erro ao carregar projetos");
      }
    });
  }

  /**
   * Retorna o estado textual de um projeto com base no seu valor numérico.
   * 
   * @param state Estado do projeto (0: Ativo, 1: Pendente, 2: Inativo).
   * @returns Estado como string.
   */
  getProjectStatus(state: number): string {
    const states = ["Ativo", "Pendente", "inátivo"];
    return states[state] ?? "Unknown"
  }

  /**
   * Filtra e retorna o número de projetos ativos.
   * 
   * @returns Número de projetos com estado ativo.
   */
  filterActiveProjects(): number {
    return this.projects.filter(project => project.status == 0).length;
  }

  /**
   * Redireciona para a página de adição de um novo projeto.
   */
  goToAddProject() {
    this.router.navigate(['/Account-project-manager/addProject'])
  }

  /**
   * Redireciona para a página de visualização/edição de um projeto específico.
   * 
   * @param id ID do projeto.
   */
  viewProject(id: number) {
    this.router.navigate([`/Account-project-manager/${id}`]);
  }

  /**
   * Elimina o projeto atualmente selecionado.
   */
  eliminar() {
    if (this.selectedProjectId) {
      this.http.delete(`${environment.apiUrl}/Projects/${this.selectedProjectId}`).subscribe({
        next: () => {
          this.closePopup();
          this.alerts.enableSuccess("Projeto eliminado com sucesso");
          this.getProjects(parseInt(this.UserId));
        },
        error: () => {
          this.closePopup();
          this.alerts.enableError("Erro ao apagar projeto com ID = " + this.selectedProjectId);
        }
      });
    }
  }

  /**
   * Altera o estado de venda do projeto (colocar ou retirar do Marketplace).
   */
  forSale() {
    if (this.selectedProjectId) {
      this.http.patch(`${environment.apiUrl}/Projects/forSale/${this.selectedProjectId}`, {}).subscribe({
        next: () => {
          this.closeForSale();
          this.getProjects(parseInt(this.UserId)); // Refresh the project list after updating
          this.alerts.enableSuccess('Estado de venda do projeto alterado com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao colocar projeto à venda:', error);
          this.alerts.enableError('Erro ao colocar projeto à venda.');
        },
      });
    }
  }

  /**
   * Abre o popup de confirmação para eliminar um projeto.
   * 
   * @param project_id ID do projeto a eliminar.
   */
  openPopup(project_id: number) {
    this.selectedProjectId = project_id;
    const overlay = document.getElementById('modalOverlayDelete');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  /**
   * Fecha o popup de confirmação de eliminação.
   */
  closePopup() {
    this.selectedProjectId = null;
    const overlay = document.getElementById('modalOverlayDelete');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }

  /**
   * Abre o popup de confirmação para alterar o estado de venda do projeto.
   * 
   * @param project_id ID do projeto.
   * @param isForSale Booleano que indica se o projeto já está à venda.
   * @param availableCC Número de créditos de carbono disponíveis no projeto.
   */
  openForSale(project_id: number, isForSale: boolean, availableCC: number) {
    this.selectedProjectId = project_id;

    const overlay = document.getElementById('modalOverlayForSale');
    const delPopup = document.getElementById('popup-for-sale');
    const heading = document.querySelector('.sale-heading');
    const description = document.querySelector('.sale-description');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }

    if (heading && description) {
      heading.textContent = isForSale
        ? 'Tem a certeza que quer retirar este projeto de venda?'
        : 'Tem a certeza que quer colocar este projeto à venda?';

      description.textContent = isForSale
        ? 'Esta ação irá retirar o projeto do Marketplace e outros utilizadores não o poderão ver.'
        : 'Esta ação irá disponibilizar o projeto no Marketplace onde todos os utilizadores o possam ver.';
    }
  }

  /**
   * Fecha o popup de venda.
   */
  closeForSale() {
    this.selectedProjectId = null;
    const overlay = document.getElementById('modalOverlayForSale');
    const delPopup = document.getElementById('popup-for-sale');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }
}
