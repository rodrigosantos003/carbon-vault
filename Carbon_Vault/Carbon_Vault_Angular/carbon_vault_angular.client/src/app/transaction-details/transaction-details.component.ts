import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth-service.service';
import { Router,ActivatedRoute } from '@angular/router';

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

  constructor(private route: ActivatedRoute, private http: HttpClient, private auth: AuthService) { }

  ngOnInit() {
    this.transactionId = this.route.snapshot.paramMap.get('id') ?? ""; 

    if(!this.transactionId) {
      console.error("ID da transação não informado");
      return;
    }

    var url = environment.apiUrl + "/transactions/details/" + this.transactionId;

    var token = localStorage.getItem('token');

    var userId = this.auth.getUserId();

    console.log("Token:", token);
    console.log("UserID:", userId);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'userID': userId
    });

    this.http.get(url, { headers }).subscribe((data: any) => {
      console.log("Dados da transação:", data);

      var type;

      switch(userId){
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
      this.transactionProject = data.project;
      this.transactionDate = data.date;
      this.transactionQuantity = data.quantity;
      this.transactionTotal = data.totalPrice;
      this.transactionSession = data.checkoutSession;
      this.transactionMethod = data.paymentMethod;
    }, error => {
      console.error("Erro na requisição:", error);
    });
  }
}
