import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth-service.service';
@Component({
  selector: 'app-project-add',
  standalone: false,
  
  templateUrl: './project-add.component.html',
  styleUrl: './project-add.component.css'
})
export class ProjectAddComponent {
  nome: string = '';
  descricao: string = '';
  localizacao: string = '';
  dataInicio: string = '';
  dataFim: string = '';
  desenvolvedor: string = '';
  certificacao: string = '';
  status:  number | null = null;
  urlProjeto: string = '';
  urlImagem: string = '';
  preco: number | null = null;
  documentos: File[] = [];
  categoriasSelecionadas: number[] = [];
  private apiURL = `${environment.apiUrl}/Projects`;
  userId: string;
  imagem: File | null = null;
  imagePreviewUrl: string | null = null;


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
  constructor(private http: HttpClient,private authService: AuthService) {
    this.userId = this.authService.getUserId();

  }
  onFileChange(event: any) {
    const newFiles = Array.from(event.target.files) as File[]; // Type cast here
  
    this.documentos = [...this.documentos, ...newFiles];
  }
 
  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagem = file;

       const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadImage(projectId : number): Promise<string> {
    if (!this.imagem) return '';
    const formData = new FormData();
    formData.append('file', this.imagem);

    try {
      const response: any = await this.http.post(`${this.apiURL}/${projectId}/uploadImage`, formData).toPromise();
      return response.filePath;
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      return '';
    }
  }

  onCategoriaChange(categoriaId: number, event: any) {
    if (event.target.checked) {
      this.categoriasSelecionadas.push(categoriaId);
    } else {
      this.categoriasSelecionadas = this.categoriasSelecionadas.filter(c => c !== categoriaId);
    }
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy'; 
  }

  
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  
    const fileList: FileList = event.dataTransfer?.files!;
    if (fileList && fileList.length > 0) {
      const newFiles = Array.from(fileList);
  
      
      this.documentos = [...this.documentos, ...newFiles];
    }
    console.log(this.documentos);
  }
 
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  async onSubmit() {
      const inicio = new Date(this.dataInicio);
    const fim = new Date(this.dataFim);

    if (inicio > fim) {
      alert('A data de início não pode ser depois da data de fim.');
      return;
    }

    const projeto = {
      name: this.nome,
      description: this.descricao,
      location: this.localizacao,
      startDate: this.dataInicio,
      endDate: this.dataFim,
      developer: this.desenvolvedor,
      certification: this.certificacao,
      pricePerCredit: this.preco,
      status: 0,
      projectUrl: this.urlProjeto,
      imageUrl: this.urlImagem,
      ownerId: Number(this.userId),
      types: this.categoriasSelecionadas.map(id => ({ id }))
    };

    try {
      const response: any = await this.http.post(this.apiURL, projeto).toPromise();
      const projectId = response.id;

      if (this.documentos.length > 0) {
        const formData = new FormData();
        this.documentos.forEach(file => formData.append('files', file));
        await this.http.post(`${this.apiURL}/${projectId}/upload`, formData).toPromise();
      }
      if (this.imagem) {
        this.urlImagem = await this.uploadImage(projectId);
      }

      alert('Projeto criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar o projeto:', error);
    }
  }
}
