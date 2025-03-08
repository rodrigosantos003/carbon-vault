import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  
})
export class ApiService {
  private baseUrl = 'https://localhost:7117';  

  constructor(private http: HttpClient) {}

  //---------------- Projetos ---------------------------

 
}
