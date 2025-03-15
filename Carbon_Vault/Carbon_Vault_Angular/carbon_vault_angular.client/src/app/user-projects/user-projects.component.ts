import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-projects',
  standalone: false,

  templateUrl: './user-projects.component.html',
  styleUrl: './user-projects.component.css'
})
export class UserProjectsComponent {
  myProjects: Project[] = [];
  userId: any;

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
    this.userId = authService.getUserId();
    console.log("User ID = " + this.userId);
  }

  ngOnInit(): void {
    this.http.get(`${environment.apiUrl}/Projects/user/${this.userId}`).subscribe(
      (data: any) => {
        this.myProjects = data;
        this.myProjects.forEach(p => {
          p.forSale = 1;
        });
        console.log("My Projects:", this.myProjects);
      },
      error => {
        console.error("Error fetching projects:", error);
      }
    );
  }

  getProjectStatus(idx: number): string {
    const _status = ["Confirmado", "Em Revisão", "Recusado"]

    return _status[idx];
  }

  editBtn(projetoId: any) {
    // Find the selected project by ID
    const selectedProject = this.myProjects.find(project => project.id === projetoId);

    // Use the Router to navigate to the edit page and pass the project data as state
    if (selectedProject) {
      //this.router.navigate(['/edit-project', projetoId], { state: { project: selectedProject } });
      this.router.navigate([`user-projects/edit-project/${projetoId}`]);
    }
  }
}

export interface Project {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  types: any; // Assuming ProjectType is defined elsewhere
  location: string;
  carbonCreditsGenerated: number;
  startDate: Date;
  endDate: Date;
  developer: string;
  certification: string;
  pricePerCredit: number;
  status: any;
  benefits: string;
  projectUrl: string;
  imageUrl: string;
  carbonCredits: any; // Assuming CarbonCredit is defined elsewhere
  createdAt: Date;
  forSale: number;
}
