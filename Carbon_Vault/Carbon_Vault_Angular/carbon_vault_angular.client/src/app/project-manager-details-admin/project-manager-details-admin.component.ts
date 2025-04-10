import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth-service.service';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '../alerts.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-project-manager-details-admin',
  standalone: false,

  templateUrl: './project-manager-details-admin.component.html',
  styleUrl: './project-manager-details-admin.component.css'
})
export class ProjectManagerDetailsAdminComponent {


  project: any = {};
  categoriasSelecionadas: number[] = [];
  documentos: File[] = [];
  documentosAtuais: Documento[] = [];
  imagem: File | null = null;
  imagePreviewUrl: string | null = null;
  isEditable: boolean = true;
  isAddingFiles: boolean = false;
  private apiURL = `${environment.apiUrl}/Projects`;
  showRejectionFeedback: boolean = false;
  showAprovedFeedback: boolean = false;
  showAddCredits: boolean = true;
  showChangeState: boolean = false;
  additionalCredits: number = 0;
  rejectionFeedback: string | null = null;
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

  /**
   * Construtor do componente.
   *
   * @param {HttpClient} http - Serviço para realizar requisições HTTP.
   * @param {ActivatedRoute} route - Serviço para obter informações da rota.
   * @param {AuthService} authService - Serviço para autenticação.
   * @param {AlertsService} alerts - Serviço para mostrar alertas.
   * @param {Location} location - Serviço para navegação na aplicação.
   */
  constructor(private http: HttpClient, private route: ActivatedRoute, private authService: AuthService, private alerts: AlertsService, private location: Location) { }

  /**
   * Inicializa o componente, carregando os detalhes do projeto e arquivos.
   *
   */
  ngOnInit() {
    this.alerts.enableLoading("A carregar informação do projeto...");
    const projectId = this.route.snapshot.params['id'];

    Promise.all([this.fetchProjectDetails(projectId), this.loadProjectFiles(projectId)]);
    this.alerts.disableLoading();
  }

  /**
   * Obtém o status de um projeto baseado no estado numérico.
   *
   * @param {number} state - O estado do projeto (0: Ativo, 1: Pendente, 2: Inativo).
   * @returns {string} O nome do estado do projeto.
   */
  getProjectStatus(state: number): string {
    const states = ["Ativo", "Pendente", "inátivo"];
    return states[state] ?? "Unknown"
  }

  /**
   * Aprova o projeto, gerando créditos de carbono.
   *
   */
  approveProject() {
    const projectId = this.project.id;
    const url = `${this.apiURL}/${projectId}/approve`;
    const creditsGenerated = this.project.carbonCreditsGenerated;

    if (creditsGenerated <= 0) {
      this.alerts.enableError('O número de créditos deve ser maior que 0.');
      return;
    }

    let headers = this.authService.getHeaders();
    headers = headers.append('CreditsGenerated', creditsGenerated.toString());

    this.http.post(url, {}, { headers }).subscribe({
      next: () => {
        this.alerts.enableSuccess('Projeto aprovado e créditos gerados com sucesso!');
        this.showAprovedFeedback = true;
        //this.goBack();
      },
      error: () => {
        this.alerts.enableError('Ocorreu um erro ao aprovar o projeto. Tente novamente mais tarde.');
      }
    });
  }

  /**
   * Adiciona créditos ao projeto.
   *
   */
  addCredits() {
    const projectId = this.project.id;
    const url = `${this.apiURL}/${projectId}/addCredits`;
    const creditsGenerated = this.additionalCredits;

    if (this.additionalCredits <= 0) {
      this.alerts.enableError('O número de créditos deve ser maior que 0.');
      return;
    }

    let headers = this.authService.getHeaders();
    headers = headers.append('NumberOfCredits', creditsGenerated.toString());

    this.http.post(url, {}, { headers }).subscribe({
      next: () => {
        this.alerts.enableSuccess(this.additionalCredits + ' Créditos gerados com sucesso!');
        this.fetchProjectDetails(this.route.snapshot.params['id']);
      },
      error: (e) => {
        this.alerts.enableError('Ocorreu um erro ao aprovar o projeto. Tente novamente mais tarde.');
      }
    });
  }

  /**
   * Obtém os detalhes do projeto a partir da API.
   *
   * @param {number} projectId - O ID do projeto a ser carregado.
   */
  async fetchProjectDetails(projectId: number) {
    this.http.get(`${this.apiURL}/${projectId}`).subscribe((response: any) => {
      this.project = response;
      if (this.project.status !== 0) {
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
    });
  }

  /**
   * Função de callback para o evento de drag over.
   *
   * @param {DragEvent} event - O evento de drag over.
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
  }

  /**
   * Função de callback para o evento de drop.
   *
   * @param {DragEvent} event - O evento de drop.
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const fileList: FileList = event.dataTransfer?.files!;
    if (fileList && fileList.length > 0) {
      const newFiles = Array.from(fileList);

      this.documentos = [...this.documentos, ...newFiles];
    }
  }

  /**
   * Função de callback para o evento de drag leave.
   *
   * @param {DragEvent} event - O evento de drag leave.
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Função chamada ao alterar uma categoria selecionada.
   *
   * @param {number} categoriaId - O ID da categoria.
   * @param {Event} event - O evento que contém o valor alterado.
   */
  onCategoriaChange(categoriaId: number, event: any) {
    if (event.target.checked) {
      this.categoriasSelecionadas.push(categoriaId);
    } else {
      this.categoriasSelecionadas = this.categoriasSelecionadas.filter(id => id !== categoriaId);
    }
  }

  /**
   * Carrega os arquivos do projeto a partir da API.
   *
   * @param {number} projectId - O ID do projeto para carregar os arquivos.
   * @returns {Promise<void>}
   */
  async loadProjectFiles(projectId: number): Promise<void> {
    this.http.get<any[]>(`${this.apiURL}/${projectId}/files`).subscribe((files) => {
      this.documentosAtuais = files.filter(file => file.filePath != this.project.imageUrl);
    });
  }

  /**
   * Função chamada ao alterar os arquivos do projeto.
   *
   * @param {Event} event - O evento de mudança dos arquivos.
   */
  onFileChange(event: any) {
    const newFiles = Array.from(event.target.files) as File[];
    this.documentos = [...this.documentos, ...newFiles];
  }

  /**
   * Elimina um arquivo associado ao projeto.
   *
   * @param {number} fileId - O ID do arquivo a ser eliminado.
   * @returns {void}
   */
  deleteFile(fileId: number): void {
    const projectId = this.project.id;
    this.http.delete<void>(`${this.apiURL}/${projectId}/files/${fileId}`, { headers: this.authService.getHeaders() }).subscribe({
      next: () => {
        this.fetchProjectDetails(projectId);
        this.loadProjectFiles(projectId);
        this.alerts.enableSuccess('Ficheiro Eliminado com sucesso do projeto');
      }, error: () => {
        this.alerts.enableError('Um erro aconteceu tente novamente mais tarde');
      }
    });
  }

  /**
   * Altera o estado do projeto.
   *
   * @param {number} newStatus - O novo estado do projeto.
   */
  changeProjectStatus(newStatus: number) {
    const projectId = this.project.id;
    const url = `${this.apiURL}/${projectId}/ChangeStatus`;

    let headers = this.authService.getHeaders();
    headers = headers.append('Content-Type', 'application/json');

    const body = JSON.stringify(newStatus);

    this.http.put(url, body, { headers }).subscribe({
      next: () => {
        this.alerts.enableSuccess('O estado do projeto foi atualizado com sucesso!');
        this.fetchProjectDetails(projectId); // Refresh the project details
      },
      error: () => {
        this.alerts.enableError('Ocorreu um erro ao atualizar o estado do projeto. Tente novamente mais tarde.');
      }
    });
  }

  /**
   * Rejeita o projeto, fornecendo feedback.
   *
   */
  rejectProject() {
    if (!this.rejectionFeedback || this.rejectionFeedback.trim() === "") {
      this.alerts.enableError('Por favor, insira um feedback antes de rejeitar o projeto.');
      return;
    }

    const projectId = this.project.id;
    const url = `${this.apiURL}/${projectId}/reject`;

    let headers = this.authService.getHeaders();
    headers = headers.append('feedback', this.rejectionFeedback);

    this.http.post(url, {}, { headers }).subscribe({
      next: () => {
        this.alerts.enableSuccess('Projeto rejeitado com sucesso!');
        this.isEditable = false;
      },
      error: (error) => {
        this.alerts.enableError('Ocorreu um erro ao rejeitar o projeto. Tente novamente mais tarde.');
      }
    }
    );
  }

  /**
   * Função chamada ao alterar a imagem do projeto.
   *
   * @param {Event} event - O evento de mudança da imagem.
   * @returns {void}
   */
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

  /**
   * Função chamada para baixar um arquivo do projeto.
   *
   * @param {string} filePath - O caminho do arquivo a ser baixado.
   * @param {string} fileName - O nome do arquivo a ser baixado.
   */
  downloadFile(filePath: string, fileName: string) {
    const url = `${filePath}`;
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
  }

  /**
   * Altera o modo de edição para permitir a adição de arquivos.
   *
   */
  changeToEditMode() {
    this.isAddingFiles = true;
  }

  /**
   * Reverte o modo de edição, removendo arquivos selecionados.
   *
   */
  RevertToEditMode() {
    this.isAddingFiles = false;
    this.documentos = [];
  }

  /**
   * Navega para a página anterior.
   *
   * @returns {void}
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Submete as alterações feitas no projeto.
   *
   * @returns {Promise<void>}
   */
  async onSubmit(): Promise<void> {
    if (this.imagem) {
      const projectId = this.project.id;
      const formData = new FormData();
      formData.append('file', this.imagem);

      try {
        const response: any = await this.http.post(`${this.apiURL}/${projectId}/uploadImage`, formData).toPromise();
        this.project.imageUrl = response.filePath;
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
      }
    }

    const updatedProject = {
      ...this.project,
      types: this.categoriasSelecionadas.map((id) => ({ id })),
    };

    try {
      await this.http.put(`${this.apiURL}/${this.project.id}`, updatedProject).toPromise();
      alert('Projeto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar o projeto:', error);
    }
  }
}

/**
 * Interface que representa um documento associado a um projeto.
 */
interface Documento {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;
  projectId: number;
}
