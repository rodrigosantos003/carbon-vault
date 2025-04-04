import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth-service.service';
import { Router, ActivatedRoute } from '@angular/router';
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

  constructor(private route: ActivatedRoute, private http: HttpClient, private auth: AuthService, private alerts: AlertsService) { }

  ngOnInit() {
    this.transactionId = this.route.snapshot.paramMap.get('id') ?? "";

    if (!this.transactionId) {
      console.error("ID da transação não informado");
      return;
    }

    var url = environment.apiUrl + "/Transactions/details/" + this.transactionId;

    var userId = this.auth.getUserId();

    this.http.get(url, { headers: this.auth.getHeaders()}).subscribe((data: any) => {
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

      console.log(data);
      this.transactionType = type;
      this.transactionBuyer = data.buyerName;
      this.transactionSeller = data.sellerName;
      this.transactionProject = data.project;
      this.transactionDate = data.date;
      this.transactionQuantity = data.quantity;
      this.transactionTotal = data.totalPrice;
      this.transactionSession = data.checkoutSession;
      this.transactionMethod = data.paymentMethod;
      this.projectCertifier = data.projectCertifier;
      this.projectLocation = data.projectLocation;
      this.projectDescription = data.projectDescription;

    }, error => {
      console.error("Erro na requisição:", error);
      this.alerts.enableError("Erro ao obter transação");
    });
  }

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
