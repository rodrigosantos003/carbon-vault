import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';  // Importa o AuthService
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

  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) {
    this.UserId = this.authService.getUserId();
  }
  ngOnInit(): void {
    this.getProjects();
  }

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

  viewProject(id: number) {
    console.log(id);
    this.router.navigate([`project-manager/${id}`]);
  }
  getProjectStatus(state: number): string {
    const states = ["Ativo", "Pendente", "inátivo"];
    return states[state] ?? "Unknown"
  }
  filterActiveProjects(): number {
    return this.projects.filter(project => project.status == 0).length;
  }

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

  closePopup() {
    this.selectedProjectId = null;
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }

  eliminar() {
    if (this.selectedProjectId) {
      console.log("ID projeto " + this.selectedProjectId);
      this.http.delete(`${environment.apiUrl}/Projects/${this.selectedProjectId}`).subscribe({
        next: () => {
          console.log('Project deleted successfully');
          this.alerts.enableSuccess("Projeto eliminado com sucesso");
          this.getProjects();
        },
        error: (err) => {
          console.error('Error deleting project:', err);
          this.alerts.enableError("Erro ao apagar projeto com ID = " + this.selectedProjectId);
        }
      });
    }
  }
}


