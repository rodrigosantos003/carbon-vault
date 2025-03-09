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

  constructor(private http: HttpClient, private alerts: AlertsService, private authService: AuthService, private router: Router ) { }
  ngOnInit(): void {
    this.getProjects();
    
    console.log(this.projects);
  }
  getProjects(): void {
    this.alerts.enableLoading("A carregar Projetos..");
    this.http.get<any[]>(this.projectsURL).subscribe({
      next: (data) => {
        console.log(data);
        this.projects = data; 
        this.alerts.disableLoading();
      },
      error: (error) => {
        console.error('Erro ao encontrar as contas:', error);
        this.alerts.disableLoading();
      }
    });
  }
 
}


