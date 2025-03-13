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
  UserId :  string = '';
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
 
}
