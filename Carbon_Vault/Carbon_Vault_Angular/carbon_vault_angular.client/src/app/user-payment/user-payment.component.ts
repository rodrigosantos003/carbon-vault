import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-payment',
  standalone: false,
  
  templateUrl: './user-payment.component.html',
  styleUrl: './user-payment.component.css'
})

export class UserPaymentComponent {
  private apiUrl = `${environment.apiUrl}/UserPayments`;

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
