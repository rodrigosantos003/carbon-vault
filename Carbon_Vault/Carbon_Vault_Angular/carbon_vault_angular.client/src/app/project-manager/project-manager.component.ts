import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertsService } from '../services/alerts.service';
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
  projects: object[] = [];
  private apiURL = `${environment.apiUrl}/Projects`;

}


