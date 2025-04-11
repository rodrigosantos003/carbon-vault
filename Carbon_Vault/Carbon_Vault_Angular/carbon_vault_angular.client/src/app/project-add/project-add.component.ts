import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AlertsService } from '../alerts.service';
import { Location } from '@angular/common';
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
  status: number | null = null;
  urlProjeto: string = '';
  urlImagem: string = '';
  preco: number | null = null;
  benefits: string = '';
  documentos: File[] = [];
  categoriasSelecionadas: number[] = [];
  private apiURL = `${environment.apiUrl}/Projects`;
  userId: string;
  imagem: File | null = null;
  imagePreviewUrl: string | null = null;

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

  /**
 * Construtor do componente `ProjectAddComponent`.
 * Inicializa o componente com os serviços necessários para comunicação HTTP, autenticação do utilizador, alertas e navegação.
 * 
 * @param http Serviço para realizar requisições HTTP.
 * @param authService Serviço de autenticação do utilizador.
 * @param alerts Serviço de alertas.
 * @param location Serviço de navegação de localização.
 */
  constructor(private http: HttpClient, private authService: AuthService, private alerts: AlertsService, private location: Location) {
    this.userId = this.authService.getUserId();
  }

  /**
 * Método que permite voltar para a página anterior.
 */
  goBack(): void {
    this.location.back();
  }

  /**
 * Valida os campos do formulário.
 * - Verifica se todos os campos obrigatórios foram preenchidos corretamente.
 * - Verifica se as datas estão corretas (data de início não pode ser posterior à data de fim).
 * - Verifica se pelo menos uma categoria foi selecionada.
 * 
 * @returns `true` se o formulário for válido, `false` caso contrário.
 */
  validateForm(): boolean {
    if (!this.nome.trim()) {
      this.alerts.enableError('O nome é obrigatório.');
      return false;
    }
    if (this.preco == null || this.preco <= 0 || this.preco > 1000) {
      this.alerts.enableError('O preço tem que ser maior que 0 e menor que 1000.');
      return false;
    }
    if (!this.localizacao.trim()) {
      this.alerts.enableError('A localização é obrigatória.');
      return false;
    }
    if (!this.descricao.trim()) {
      this.alerts.enableError('A descrição é obrigatória.');
      return false;
    }
    if (!this.benefits.trim()) {
      this.alerts.enableError('Os benefícios são obrigatórios.');
      return false;
    }
    if (!this.dataInicio) {
      this.alerts.enableError('A data de início é obrigatória.');
      return false;
    }
    if (!this.dataFim) {
      this.alerts.enableError('A data de fim é obrigatória.');
      return false;
    }
    if (!this.desenvolvedor.trim()) {
      this.alerts.enableError('A indicação do desenvolvedor é obrigatória.');
      return false;
    }

    if (!this.certificacao.trim()) {
      this.alerts.enableError('A indicação da certificação é obrigatória.');
      return false;
    }

    if (this.dataInicio && this.dataFim) {
      const inicio = new Date(this.dataInicio);
      const fim = new Date(this.dataFim);
      if (inicio > fim) {
        this.alerts.enableError('A data de início não pode ser posterior à data de fim.');
        return false;
      }
    }
    if (this.categoriasSelecionadas.length === 0) {
      this.alerts.enableError('Deve selecionar pelo menos uma categoria.');
      return false;
    }

    return true;
  }

  /**
 * Adiciona arquivos ao array de documentos a serem enviados.
 * 
 * @param event Evento disparado ao selecionar arquivos.
 */
  onFileChange(event: any) {
    const newFiles = Array.from(event.target.files) as File[];

    this.documentos = [...this.documentos, ...newFiles];
  }

  /**
 * Remove um arquivo da lista de documentos.
 * 
 * @param index Índice do arquivo a ser removido.
 */
  removeFile(index: number) {
    this.documentos.splice(index, 1);
  }

  /**
 * Valida e carrega a imagem selecionada.
 * - Verifica o tipo e tamanho do arquivo da imagem.
 * - Mostra uma prévia da imagem caso seja válida.
 * 
 * @param event Evento disparado ao selecionar uma imagem.
 */
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

  errors: any = {};

  /**
 * Envia a imagem para o backend.
 * 
 * @param projectId ID do projeto a ser associado à imagem.
 * @returns A URL da imagem enviada.
 */
  async uploadImage(projectId: number): Promise<string> {
    if (!this.imagem) return '';
    const formData = new FormData();
    formData.append('file', this.imagem);

    try {
      const response: any = await this.http.post(`${this.apiURL}/${projectId}/uploadImage`, formData).toPromise();
      return response.filePath;
    } catch (error) {
      this.alerts.enableError("Erro ao enviar imagem");
      return '';
    }
  }

  /**
 * Atualiza a lista de categorias selecionadas com base no estado da checkbox.
 * 
 * @param categoriaId ID da categoria.
 * @param event Evento disparado ao alterar o estado da checkbox.
 */
  onCategoriaChange(categoriaId: number, event: any) {
    if (event.target.checked) {
      this.categoriasSelecionadas.push(categoriaId);
    } else {
      this.categoriasSelecionadas = this.categoriasSelecionadas.filter(c => c !== categoriaId);
    }
  }

  /**
 * Previne o comportamento padrão de arrastar e soltar e define o efeito de cópia.
 * 
 * @param event Evento de arrastar.
 */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
  }

  /**
 * Lida com o evento de soltar arquivos na área de arrastar e soltar.
 * - Valida os arquivos arrastados (tipo e tamanho).
 * - Adiciona os arquivos válidos à lista de documentos.
 * 
 * @param event Evento de soltar.
 */
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

        // Validate file size
        if (file.size > this.maxFileSize) {
          this.alerts.enableError("Ficheiro demasiado grande. O limite são " + this.maxMb + "MB.");
          return;
        }
      }

      // If all files are valid, add them
      this.documentos = [...this.documentos, ...droppedFiles];
    }
  }

  /**
 * Previne o comportamento padrão de arrastar e soltar.
 * 
 * @param event Evento de sair com o mouse da área de arrastar.
 */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
 * Envia os dados do projeto para o backend.
 * - Valida o formulário e verifica se os dados estão corretos.
 * - Envia os dados do projeto e seus arquivos.
 * - Mostra um alerta de sucesso ou erro com base na resposta da API.
 */
  async onSubmit() {
    if (!this.validateForm()) return;

    const inicio = new Date(this.dataInicio);
    const fim = new Date(this.dataFim);

    if (inicio > fim) {
      this.alerts.enableError('A data de início não pode ser depois da data de fim.');
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
      status: 1,
      projectUrl: this.urlProjeto,
      imageUrl: this.urlImagem,
      ownerId: Number(this.userId),
      benefits: this.benefits,
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

      this.alerts.enableSuccess('Projeto criado com sucesso!')
      this.goBack()
    } catch (error) {
      this.alerts.enableError('Erro ao criar o projeto:');
    }
  }
}
