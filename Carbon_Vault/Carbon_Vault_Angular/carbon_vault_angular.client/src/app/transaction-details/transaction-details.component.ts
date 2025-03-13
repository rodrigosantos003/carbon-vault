import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-transaction-details',
  standalone: false,
  
  templateUrl: './transaction-details.component.html',
  styleUrl: './transaction-details.component.css'
})
export class TransactionDetailsComponent {
  transactionId: string | null = null;
  transactionData: any = null;
  userInfo: any = null;
  private apiURL = `${environment.apiUrl}/Transactions`;

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id') ?? "";
    this.http.get(`${this.apiURL}/${this.transactionId}`).subscribe((data: any) => {
      this.transactionData = data;
      console.log(this.transactionData);
      console.log("Numero de user em OnInit = " + this.transactionData.userId);
      this.getUserInfo(this.transactionData.userId);
    }, error => {
      console.error("Erro na requisição:", error);
    });
  }

  getUserInfo(userId: number) {
    console.log("Numero de user = " + userId);
    this.http.get(`${environment.apiUrl}/Accounts/${userId}`).subscribe((data: any) => {
      this.userInfo = data;
      console.log(this.userInfo);
    }, error => {
      console.error("Erro na requisição:", error);
    });
  }

  getTransactionState(state: number): string {
    const states = ["Concluido", "Rejeitado", "por concluir"];
    return states[state] ?? "Unknown";
  }
  getTransactionPaymentState(state: number): string {
    const states = ["Pago", "Rejeitado", "Pendente"];
    return states[state] ?? "Unknown";
  }
  showPaymentMethod(payment: string): string {
    if (payment === "card") {
      return "Cartão de Crédito";
    }
    return "Unknown";
  }
  getTransactionType(type: number): string {
    const types = ["Compra", "Venda"];
    return types[type] ?? "Unknown";
  }
}
