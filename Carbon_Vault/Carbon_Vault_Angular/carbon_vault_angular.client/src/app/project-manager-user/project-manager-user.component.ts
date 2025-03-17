import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';  // Importa o AuthService
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
  saleTitle: string = "Tem a certeza que quer retirar este projeto de venda?";
  saleContent: string = "Esta ação irá retirar o projeto do Marketplace e outros utilizadores não o poderão ver.";
  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router ) { 
    this.UserId = this.authService.getUserId()
  }
  ngOnInit(): void {
    this.getProjects(parseInt(this.UserId));
    
    console.log(this.projects);
   
  }
  getProjects(id: number): void {
    this.alerts.enableLoading("A carregar Projetos..");
    this.http.get<any[]>(`${environment.apiUrl}/Projects/user/${id}`).subscribe({
      next: (data) => {
        console.log(data);
        this.projects = data; 
        this.alerts.disableLoading();
      },
      error: (error) => {
        console.error('Erro ao encontrar os projetos:', error);
        this.alerts.disableLoading();
      }
    });
  }
  getProjectStatus (state: number) :string{
  const states = ["Ativo", "Pendente", "inátivo"];
    return states[state] ?? "Unknown"
  }
  filterActiveProjects(): number {
    return this.projects.filter(project => project.status == 0).length;
  }
  
 goToAddProject(){
  this.router.navigate(['/Account-project-manager/addProject'])
 }

  viewProject(id: number) {
    this.alerts.enableSuccess("Clicou para ver projeto " + id);
    this.router.navigate([`/Account-project-manager/${id}`]);
  }

  eliminar() {
    if (this.selectedProjectId) {
      console.log("ID projeto " + this.selectedProjectId);
      this.http.delete(`${environment.apiUrl}/Projects/${this.selectedProjectId}`).subscribe({
        next: () => {
          console.log('Project deleted successfully');
          this.alerts.enableSuccess("Projeto eliminado com sucesso");
          this.getProjects(parseInt(this.UserId));
        },
        error: (err) => {
          console.error('Error deleting project:', err);
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
          this.alerts.enableSuccess('Projeto colocado à venda com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao colocar projeto à venda:', error);
          this.alerts.enableError('Erro ao colocar projeto à venda.');
        },
      });
    }
  }

  openPopup(account_id: number) {
    this.selectedProjectId = account_id;
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

  openForSale(account_id: number, isForSale: boolean) {
    this.selectedProjectId = account_id;

    const overlay = document.getElementById('modalOverlayForSale');
    const delPopup = document.getElementById('popup-for-sale');
    const heading = document.querySelector('.sale-heading');
    const description = document.querySelector('.sale-description');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }

    // Atualiza dinamicamente o texto com base no estado do projeto
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
