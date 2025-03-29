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
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router) {
    this.UserId = this.authService.getUserId()
  }
  ngOnInit(): void {
    this.getProjects(parseInt(this.UserId));
  }

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
  getProjectStatus(state: number): string {
    const states = ["Ativo", "Pendente", "inátivo"];
    return states[state] ?? "Unknown"
  }
  filterActiveProjects(): number {
    return this.projects.filter(project => project.status == 0).length;
  }

  goToAddProject() {
    this.router.navigate(['/Account-project-manager/addProject'])
  }

  viewProject(id: number) {
    this.router.navigate([`/Account-project-manager/${id}`]);
  }

  eliminar() {
    if (this.selectedProjectId) {
      this.http.delete(`${environment.apiUrl}/Projects/${this.selectedProjectId}`).subscribe({
        next: () => {
          this.alerts.enableSuccess("Projeto eliminado com sucesso");
          this.getProjects(parseInt(this.UserId));
        },
        error: (err) => {
          this.alerts.enableError("Erro ao apagar projeto com ID = " + this.selectedProjectId);
        }
      });
    }
  }

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

  openPopup(project_id: number) {
    this.selectedProjectId = project_id;
    const overlay = document.getElementById('modalOverlayDelete');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  closePopup() {
    this.selectedProjectId = null;
    const overlay = document.getElementById('modalOverlayDelete');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }

  openForSale(project_id: number, isForSale: boolean, availableCC: number) {
    this.selectedProjectId = project_id;

    //if (availableCC === 0) {
    //  this.alerts.enableError("Não é possivel alterar o estado de venda, o projeto não tem creditos de carbono disponiveis suficientes", 6);
    //  return;
    //}

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
