import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-project-manager',
  standalone: false,

  templateUrl: './project-manager.component.html',
  styleUrl: './project-manager.component.css'
})
export class ProjectManagerComponent {
  projects: any[] = [];
  private projectsURL = `${environment.apiUrl}/Projects`;
  UserId: string = '';
  selectedProjectId: any;

  /**
 * Construtor do componente `ProjectManagerComponent`.
 * Inicializa o componente com os serviços necessários para carregar, mostrar e manipular projetos, além de gerir a autenticação do utilizador.
 * 
 * @param http Serviço para realizar requisições HTTP.
 * @param alerts Serviço de alertas.
 * @param authService Serviço de autenticação e gestão de sessão do utilizador.
 * @param router Serviço para navegação entre as páginas.
 */
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) {
    this.UserId = this.authService.getUserId();
  }

  /**
 * Método chamado na inicialização do componente.
 * - Recupera a lista de projetos chamando o método `getProjects`.
 */
  ngOnInit(): void {
    this.getProjects();
  }

  /**
 * Recupera a lista de projetos do servidor.
 * - Faz uma requisição HTTP para obter os projetos e atualiza a lista.
 * - Mostra um alerta de carregamento enquanto a requisição está em andamento.
 * - Mostra um alerta de erro caso ocorra algum problema na requisição.
 */
  getProjects(): void {
    this.alerts.enableLoading("A carregar Projetos..");
    this.http.get<any[]>(this.projectsURL).subscribe({
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
 * Navega para a página de detalhes de um projeto específico.
 * 
 * @param id O ID do projeto a ser visualizado.
 */
  viewProject(id: number) {
    console.log(id);
    this.router.navigate([`project-manager/${id}`]);
  }

  /**
 * Retorna o status de um projeto com base no valor do estado.
 * 
 * @param state O estado do projeto (0: Ativo, 1: Pendente, 2: Inativo).
 * @returns O status correspondente ao estado fornecido.
 */
  getProjectStatus(state: number): string {
    const states = ["Ativo", "Pendente", "inátivo"];
    return states[state] ?? "Unknown"
  }

  /**
 * Filtra os projetos que estão no estado "Ativo".
 * 
 * @returns O número de projetos ativos na lista de projetos.
 */
  filterActiveProjects(): number {
    return this.projects.filter(project => project.status == 0).length;
  }

  /**
 * Abre o pop-up de confirmação para eliminar um projeto.
 * 
 * @param project_id O ID do projeto a ser eliminado.
 */
  openPopup(project_id: number) {
    /*console.log("Clicou no projeto: " + project_id);*/
    this.selectedProjectId = project_id;
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  /**
 * Fecha o pop-up de confirmação de eliminar projeto.
 */
  closePopup() {
    this.selectedProjectId = null;
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }

  /**
 * Elimina o projeto selecionado.
 * - Envia uma requisição HTTP DELETE para o servidor para eliminar o projeto.
 * - Mostra um alerta de sucesso ou erro dependendo do resultado da operação.
 */
  eliminar() {
    if (this.selectedProjectId) {
      console.log("ID projeto " + this.selectedProjectId);
      this.http.delete(`${environment.apiUrl}/Projects/${this.selectedProjectId}`).subscribe({
        next: () => {
          this.closePopup();
          this.alerts.enableSuccess("Projeto eliminado com sucesso");
          this.getProjects();
        },
        error: (err) => {
          console.error('Error deleting project:', err);
          this.closePopup();
          this.alerts.enableError("Erro ao apagar projeto com ID = " + this.selectedProjectId);
        }
      });
    }
  }
}
