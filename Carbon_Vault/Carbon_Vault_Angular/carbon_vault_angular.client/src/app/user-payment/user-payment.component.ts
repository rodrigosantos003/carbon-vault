import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-payment',
  standalone: false,
  
  templateUrl: './user-payment.component.html',
  styleUrl: './user-payment.component.css'
})

export class UserPaymentComponent {
  private apiUrl = 'https://localhost:7117/api/UserPayments';

  constructor(private http: HttpClient) { }

  realizarPagamento() {
    const paymentInfo = {
      amount: 120.00,
      currency: 'EUR'
    };

    this.http.post(this.apiUrl, paymentInfo).subscribe(
      response => console.log('Pagamento realizado com sucesso:', response),
      error => console.error('Erro ao realizar pagamento:', error)
    );
  }
}
