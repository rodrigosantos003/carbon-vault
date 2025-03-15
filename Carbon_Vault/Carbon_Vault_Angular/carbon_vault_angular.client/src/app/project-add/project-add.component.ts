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
  categoriasSelecionadas: string[] = [];
  private apiURL = `${environment.apiUrl}/Projects`;
  userId: string;
  imagem: File | null = null;
  imagePreviewUrl: string | null = null;


  categorias = [
    { nome: 'Poverty', label: 'Erradicar a pobreza' },
    { nome: 'Hunger', label: 'Erradicar a fome' },
    { nome: 'Health', label: 'Saúde de Qualidade' },
    { nome: 'Education', label: 'Educação de Qualidade' },
    { nome: 'Gender', label: 'Igualdade de Gênero' },
    { nome: 'Water', label: 'Água Potável e Saneamento' },
    { nome: 'Energy', label: 'Energias Renováveis e Acessíveis' },
    { nome: 'Work', label: 'Trabalho e Crescimento Econômico' },
    { nome: 'Industry', label: 'Indústria, Renovação e Infraestruturas' },
    { nome: 'Inequalities', label: 'Reduzir as Desigualdades' },
    { nome: 'Cities', label: 'Cidades e Comunidades Sustentáveis' },
    { nome: 'Consumption', label: 'Produção e Consumo Sustentáveis' },
    { nome: 'ClimateAction', label: 'Ação Climática' },
    { nome: 'Peace', label: 'Paz, Justiça e Instituições Eficazes' },
    { nome: 'WaterLife', label: 'Proteger a Vida Marinha' },
    { nome: 'LandLife', label: 'Proteger a Vida Terrestre' }
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

  uploadImage(projectID : number): Promise<string> {
    const formData = new FormData();
    if (this.imagem) {
      formData.append('file', this.imagem);
    }
    return this.http.post<any>(`${this.apiURL}/${projectID}/upload`, formData).toPromise().then(response => response.url);
  }

  onCategoriaChange(categoria: string, event: any) {
    if (event.target.checked) {
      this.categoriasSelecionadas.push(categoria);
    } else {
      this.categoriasSelecionadas = this.categoriasSelecionadas.filter(c => c !== categoria);
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
    const projeto = {
      name: this.nome,
      pricePerCredit: this.preco,
      types: this.categoriasSelecionadas,
      ownerId: this.userId 
    };
    
    try {
      
      const response: any = await this.http.post(this.apiURL, projeto).toPromise();
      const projectId = response.id;

     
      if (this.documentos.length > 0) {
        const formData = new FormData();
        this.documentos.forEach(file => formData.append('file', file));

        await this.http.post(`${this.apiURL}/${projectId}/upload`, formData).toPromise();
      }

      alert('Projeto criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar o projeto:', error);
    }
  }
}
