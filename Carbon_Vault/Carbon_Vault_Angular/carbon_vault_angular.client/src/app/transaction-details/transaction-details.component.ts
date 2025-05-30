import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth-service.service';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '../alerts.service';
import { downloadPDF } from '../services/certificate-generator';

@Component({
  selector: 'app-transaction-details',
  standalone: false,

  templateUrl: './transaction-details.component.html',
  styleUrl: './transaction-details.component.css'
})
export class TransactionDetailsComponent {
  @Input() transactionType: string = ''; // Define se é compra ou venda
  @Input() transactionId: string = ''; // ID da transação
  @Input() transactionBuyer: string = ''; // Nome do comprador
  @Input() transactionSeller: string = ''; // Nome do vendedor
  @Input() transactionProject: string = ''; // Nome do projeto

  @Input() transactionDate: string = ''; // Data da transação
  @Input() transactionQuantity: string = ''; // Processador de pagamento
  @Input() transactionTotal: string = ''; // Processador de pagamento
  @Input() transactionSession: string = ''; // Sessão de pagamento
  @Input() transactionMethod: string = ''; // Processador de pagamento

  projectLocation: string = ''; // Localização do projeto
  projectCertifier: string = ''; // Certificador do projeto
  projectDescription: string = ''; // Descrição do projeto

  /**
   * Construtor do componente.
   *
   * @param route Serviço para obter parâmetros da rota.
   * @param http Cliente HTTP para requisições à API.
   * @param auth Serviço de autenticação para obter ID do utilizador e headers.
   * @param alerts Serviço de alertas e carregamentos.
   */
  constructor(private route: ActivatedRoute, private http: HttpClient, private auth: AuthService, private alerts: AlertsService) { }

  /**
   * Ciclo de vida do componente. É executado quando o componente é inicializado.
   * Obtém os detalhes da transação com base no ID da rota.
   */
  ngOnInit() {
    this.transactionId = this.route.snapshot.paramMap.get('id') ?? "";

    if (!this.transactionId) {
      return;
    }

    var url = environment.apiUrl + "/Transactions/details/" + this.transactionId;

    var userId = this.auth.getUserId();

    this.http.get(url, { headers: this.auth.getHeaders() }).subscribe((data: any) => {
      var type;

      switch (userId) {
        case data.buyerId:
          type = "Compra";
          break;
        case data.sellerId:
          type = "Venda";
          break;
        default:
          type = "Admin";
      }

      this.transactionType = type;
      this.transactionBuyer = data.buyerName;
      this.transactionSeller = data.sellerName;
      this.transactionProject = data.projectName;
      this.transactionDate = data.date;
      this.transactionQuantity = data.quantity;
      this.transactionTotal = data.totalPrice;
      this.transactionSession = data.checkoutSession;
      this.transactionMethod = data.paymentMethod;
      this.projectCertifier = data.projectCertifier;
      this.projectLocation = data.projectLocation;
      this.projectDescription = data.projectDescription;

    }, error => {
      this.alerts.enableError("Erro ao obter transação");
    });
  }

  /**
   * Permite descarregar a fatura da transação.
   * A fatura é aberta numa nova aba do navegador.
   */
  downloadInvoice() {
    this.alerts.enableLoading("A obter fatura...");

    const invoiceURL = `${environment.apiUrl}/UserPayments/invoice/${this.transactionSession}`;

    this.http.get<{ message: string, file?: string }>(invoiceURL).subscribe({
      next: (response) => {
        this.alerts.disableLoading();
        window.open(response.file);
      },
      error: (error) => {
        this.alerts.disableLoading();
        this.alerts.enableError("Erro ao obter fatura");
      }
    })
  }

  /**
   * Gera e descarrega o certificado da transação em formato PDF,
   * usando os dados preenchidos do projeto e do comprador.
   */
  downloadCertificate() {
    const info = {
      nomeAdquirente: this.transactionBuyer,
      dataAquisicao: this.transactionDate,
      quantidadeCreditos: parseInt(this.transactionQuantity),
      nomeProjeto: this.transactionProject,
      localizacaoProjeto: this.projectLocation,
      certificador: this.projectCertifier,
      descricaoProjeto: this.projectDescription
    }
    downloadPDF(info);
  }
}
