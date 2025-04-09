import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { AlertsService } from '../alerts.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-request-report',
  standalone: false,

  templateUrl: './request-report.component.html',
  styleUrl: './request-report.component.css'
})
export class RequestReportComponent {
  requestForm: FormGroup;
  documents: File[] = [];

  /**
   * Construtor do componente.
   *
   * @param fb FormBuilder para criação de formulários.
   * @param http Serviço HTTP para comunicações com a API.
   * @param router Serviço de navegação.
   * @param authService Serviço de autenticação do utilizador.
   * @param alerts Serviço de alertas para feedback visual ao utilizador.
   */
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService, // Inject AuthService
    private alerts: AlertsService
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      files: [null, [Validators.required]]
    });
  }

  /**
   * Chamada ao submeter o formulário. Inicia o processo de pedido de relatório.
   */
  onSubmit() {
    this.requestReport();
  }

  /**
   * Atualiza a lista de ficheiros quando o utilizador seleciona novos ficheiros.
   * 
   * @param event Evento de input do tipo file.
   */
  onFileSelected(event: any) {
    this.documents = Array.from(event.target.files);
  }

  /**
   * Retorna os nomes dos ficheiros selecionados, separados por vírgula.
   */
  get fileNames(): string {
    return this.documents.map(file => file.name).join(', ');
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

      // If all files are valid, add them
      this.documents = [...this.documents, ...droppedFiles];
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
   * Cria um novo pedido de relatório através da API.
   * O relatório é criado com o ID do utilizador autenticado e texto vazio.
   */
  requestReport() {
    const createURL = `${environment.apiUrl}/Reports`;

    const report = {
      UserID: this.authService.getUserId(),
      Text: ""
    };

    this.http.post<{
      "id": number,
      "userID": number,
      "lastUpdate": string,
      "reportState": number,
      "text": string,
      "files": []
    }>(createURL, report).subscribe({
      next: (data) => {
        this.uploadDocuments(data);
      },
      error: () => this.alerts.enableError("Erro ao criar pedido de relatório")
    });
  }

  /**
   * Faz upload dos ficheiros associados ao pedido de relatório recém-criado.
   *
   * @param data Dados do relatório criado (inclui ID).
   */
  uploadDocuments(data: any) {
    const uploadURL = `${environment.apiUrl}/Reports/${data.id}/upload`

    const formData = new FormData();
    this.documents.forEach(file => formData.append('files', file));

    this.http.post(uploadURL, formData).subscribe({
      next: () => this.payReport(data.id),
      error: () => this.alerts.enableError("Erro ao fazer upload")
    })
  }

  /**
   * Inicia o processo de pagamento do relatório, criando uma sessão de pagamento.
   *
   * @param id ID do relatório criado.
   */
  payReport(id: number) {
    const url = `${environment.apiUrl}/UserPayments?type=report`;

    const paymentData = {
      Items: [
        {
          Name: "Relatório Emissões",
          Description: `Relatório de emissões - ${Date.now().toLocaleString()}`,
          Price: 56.00,
          Quantity: 1
        }
      ],
      UserID: this.authService.getUserId()
    };

    this.http.post<{ message: string; checkout_session: string; payment_url: string }>(url, paymentData).subscribe({
      next: (data) => {
        this.updateReport(id, data);
      },
      error: () => this.alerts.enableError("Erro ao iniciar pagamento")
    });
  }

  /**
   * Atualiza o relatório com a sessão de pagamento e redireciona o utilizador.
   *
   * @param id ID do relatório.
   * @param paymentData Dados da resposta da API de pagamentos.
   */
  updateReport(id: number, paymentData: any) {
    const reportURL = `${environment.apiUrl}/Reports/${id}`;

    const report = {
      id: id,
      userID: this.authService.getUserId(),
      checkoutSession: paymentData.payment_url,
      text: ""
    };

    this.http.put(reportURL, report, { headers: this.authService.getHeaders() }).subscribe({
      next: () => {
        window.open(paymentData.payment_url, "_self");
        sessionStorage.setItem("checkoutSession", paymentData.checkout_session);
        sessionStorage.setItem("reportID", id.toString());
      }
    });
  }
}
