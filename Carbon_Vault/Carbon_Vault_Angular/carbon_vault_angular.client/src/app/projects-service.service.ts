import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  projects: any;

  constructor(private http: HttpClient) { }

  getAllProjects(): any {
    this.http.get(`${environment.apiUrl}/Projects`).subscribe((data: any) => {
      this.projects = data;
      console.log(this.projects);
    }, error => {
      console.error("Erro na requisição:", error);
    });

    return this.projects;
  }

  getUserProject(userId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/Projects/user/${userId}`);
  }

}
