import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-project',
  standalone: false,
  
  templateUrl: './edit-project.component.html',
  styleUrl: './edit-project.component.css'
})
export class EditProjectComponent {
  project: any | undefined;
  projectId: any;
  editProjectForm: FormGroup;

  constructor(private route: ActivatedRoute, private activatedRoute: ActivatedRoute, private http: HttpClient, private fb: FormBuilder) {
    this.editProjectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      pricePerCredit: ['', [Validators.required, Validators.min(0)]],
      carbonCreditsGenerated: ['', [Validators.required, Validators.min(0)]],
      benefits: ['', Validators.required],
      location: ['', Validators.required],
      status: ['', Validators.required],
      forSale: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Retrieve the passed project data from the state
    this.projectId = this.route.snapshot.paramMap.get('id') ?? "";
    console.log("ID do Projeto recebido: " + this.projectId);
    this.http.get(`${environment.apiUrl}/Projects/${this.projectId}`).subscribe((data: any) => {
      this.project = data;
      this.project.forSale = 1;
      this.editProjectForm = this.fb.group({
        description: [this.project.description, Validators.required],
        benefits: [this.project.benefits, Validators.required]
      });
      console.log(this.project)
    }, error => {
      console.error("Erro na requisição:", error);
    });
  }

  onSubmit() {
    // Handle form submission for updating the project
    console.log("Updated project:", this.project);
  }

  cancel() {

  }
}

export interface Project {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  types: any;
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
  carbonCredits: any;
  createdAt: Date;
  forSale: number;
}
