import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth-service.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertsService } from '../alerts.service';

@Component({
  selector: 'app-project-manager-details',
  standalone: false,

  templateUrl: './project-manager-details.component.html',
  styleUrl: './project-manager-details.component.css'
})
export class ProjectManagerDetailsComponent {

  newCreditsForSale: number = 0;
  newPricePerCredit: number = 0;
  credits: any[] = [];
  project: any = {};
  categoriasSelecionadas: number[] = [];
  documentos: File[] = [];
  documentosAtuais: Documento[] = [];
  imagem: File | null = null;
  imagePreviewUrl: string | null = null;
  isEditable: boolean = false;
  isAddingFiles: boolean = false;
  private apiURL = `${environment.apiUrl}/Projects`;

  allowedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv'];
  maxMb = 5;
  maxFileSize = this.maxMb * 1024 * 1024; // 5MB in bytes

  allowedImageTypes = ['image/png', 'image/jpeg'];
  maxImageSize = 2 * 1024 * 1024; // 2MB

  categorias = [
    { id: 1, nome: 'Poverty', label: 'Erradicar a pobreza' },
    { id: 2, nome: 'Hunger', label: 'Erradicar a fome' },
    { id: 3, nome: 'Health', label: 'Saúde de Qualidade' },
    { id: 4, nome: 'Education', label: 'Educação de Qualidade' },
    { id: 5, nome: 'Gender', label: 'Igualdade de Gênero' },
    { id: 6, nome: 'Water', label: 'Água Potável e Saneamento' },
    { id: 7, nome: 'Energy', label: 'Energias Renováveis e Acessíveis' },
    { id: 8, nome: 'Work', label: 'Trabalho e Crescimento Econômico' },
    { id: 9, nome: 'Industry', label: 'Indústria, Renovação e Infraestruturas' },
    { id: 10, nome: 'WaterLife', label: 'Proteger a Vida Marinha' },
    { id: 11, nome: 'LandLife', label: 'Proteger a Vida Terrestre' },
    { id: 12, nome: 'Peace', label: 'Proteger a Paz global' },
    { id: 13, nome: 'Partnership', label: 'Parcerias Sustentáveis' }
  ];

  constructor(private http: HttpClient, private route: ActivatedRoute, private authService: AuthService, private alerts: AlertsService) { }

  async ngOnInit() {
    const projectId = this.route.snapshot.params['id'];
    await this.fetchProjectDetails(projectId);
    await this.loadProjectFiles(projectId);
  }

  removeFile(index: number) {
    this.documentos.splice(index, 1);
  }

  async fetchProjectDetails(projectId: number) {
    this.http.get(`${this.apiURL}/${projectId}`).subscribe((response: any) => {
      this.project = response;
      if (this.project.status === 0) {
        this.isEditable = false;
      }
      if (this.project.endDate && this.project.startDate) {
        const dateObj_start = new Date(this.project.startDate);
        const dateObj_end = new Date(this.project.endDate);
        const formattedDate_start = dateObj_start.toISOString().split('T')[0];
        const formattedDate_end = dateObj_end.toISOString().split('T')[0];

        this.project.endDate = formattedDate_end;
        this.project.startDate = formattedDate_start;
      }

      this.categoriasSelecionadas = response.types.map((type: any) => type.id);

      this.project.carbonCredits.sort((a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    });
  }

  getCreditSaleStatus(credit: any): boolean {
    return this.project.carbonCredits.indexOf(credit) < this.project.creditsForSale;
  }

  openPopup() {
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('credits-form');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  closePopup() {
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('credits-form');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }

  async toggleEditMode() {
    if (this.isEditable) {
      // Save changes when exiting edit mode
      const updatedProject = {
        ...this.project,
        types: this.categoriasSelecionadas.map((id) => ({ id })),
      };

      try {
        await this.http.put(`${this.apiURL}/${this.project.id}`, updatedProject).toPromise();
        this.alerts.enableSuccess('Projeto atualizado com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar o projeto:', error);
      }
    } else {
      // Entering edit mode: Load existing documents into the drop area
      this.documentos = this.documentosAtuais.map(doc => {
        return new File([""], doc.fileName, { type: doc.fileType });
      });
    }

    this.isEditable = !this.isEditable;
  }


  saveCarbonInfo() {
    if(this.newCreditsForSale < 0)
    {
      //alert("A quantidade de créditos para venda não pode ser negativa");
      this.alerts.enableError("A quantidade de créditos para venda não pode ser negativa");
      return;
    }

    if(this.newPricePerCredit <= 0)
    {
      //alert("O preço por crédito tem que ser positivo");
      this.alerts.enableError("O preço por crédito tem que ser positivo");
      return;
    }

    if(this.newCreditsForSale > this.project.carbonCredits.length)
    {
      //alert("Não pode vender mais créditos do que os que tem disponíveis");
      this.alerts.enableError("Não pode vender mais créditos do que os que tem disponíveis");
      return;
    }

    const body = {
      pricePerCredit: this.newPricePerCredit,
      creditsForSale: this.newCreditsForSale
    };

    this.http.put(`${this.apiURL}/credits-info/${this.project.id}`, body).subscribe(() => {
      alert("Informações de créditos atualizadas com sucesso!");
      this.newCreditsForSale = 0;
      this.newPricePerCredit = 0;
      this.closePopup();
      this.fetchProjectDetails(this.project.id);
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
  }


  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(event.dataTransfer.files) as File[];

      for (let file of droppedFiles) {
        // Validate file type
        if (!this.allowedFileTypes.includes(file.type)) {
          this.alerts.enableError("Formato inválido. Ficheiros permitidos: .docx, .pdf, .csv");
          return;
        }

        // Validate file size (10MB max)
        if (file.size > this.maxFileSize) {
          this.alerts.enableError("Ficheiro demasiado grande. O limite são " + this.maxMb + "MB.");
          return;
        }
      }

      // If all files are valid, add them
      this.documentos = [...this.documentos, ...droppedFiles];
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  onCategoriaChange(categoriaId: number, event: any) {
    if (event.target.checked) {
      this.categoriasSelecionadas.push(categoriaId);
    } else {
      this.categoriasSelecionadas = this.categoriasSelecionadas.filter(id => id !== categoriaId);
    }
  }
  async loadProjectFiles(projectId: number): Promise<void> {
    this.http.get<any[]>(`${this.apiURL}/${projectId}/files`).subscribe((files) => {
      this.documentosAtuais = files.filter(file => file.filePath != this.project.ImageUrl);
    });
  }
  onFileChange(event: any) {
    const newFiles = Array.from(event.target.files) as File[];
    this.documentos = [...this.documentos, ...newFiles];
  }

  deleteFile(fileId: number): void {
    var token = localStorage.getItem('token');
    var userId = this.authService.getUserId();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'userID': userId
    });

    const projectId = this.project.id;
    this.http.delete<void>(`${this.apiURL}/${projectId}/files/${fileId}`, { headers }).subscribe(() => {

      this.fetchProjectDetails(projectId);
      this.loadProjectFiles(projectId);
      this.alerts.enableSuccess('Ficheiro Eliminado com sucesso do projeto');
    }, error => {

      this.alerts.enableError('Um erro aconteceu tente novamente mais tarde');
      console.error('Error deleting file:', error);
    });
  }


  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate image type
    if (!this.allowedImageTypes.includes(file.type)) {
      this.alerts.enableError("Formato inválido. Apenas .png e .jpg são permitidos.");
      return;
    }

    // Validate image size
    if (file.size > this.maxImageSize) {
      this.alerts.enableError("Imagem demasiado grande. O limite são 5MB.");
      return;
    }

    // If valid, update the preview
    this.imagem = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  downloadFile(filePath: string, fileName: string) {
    const url = `${filePath}`;
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
  }

  changeToEditMode() {
    this.isAddingFiles = true;
  }
  RevertToEditMode() {
    this.isAddingFiles = false;
    this.documentos = [];
  }
  async onSubmit(): Promise<void> {
    if (this.imagem) {
      const projectId = this.project.id;
      const formData = new FormData();
      formData.append('file', this.imagem);

      try {
        const response: any = await this.http.post(`${this.apiURL}/${projectId}/uploadImage`, formData).toPromise();
        this.project.imageUrl = response.filePath;
      } catch (error) {
        this.alerts.enableError("Erro ao enviar imagem");
        console.error('Erro ao enviar imagem:', error);
      }
    }

    const updatedProject = {
      ...this.project,
      types: this.categoriasSelecionadas.map((id) => ({ id })),
    };

    try {
      await this.http.put(`${this.apiURL}/${this.project.id}`, updatedProject).toPromise();
      this.alerts.enableSuccess('Projeto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar o projeto:', error);
    }
  }
}
interface Documento {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;
  projectId: number;
}
