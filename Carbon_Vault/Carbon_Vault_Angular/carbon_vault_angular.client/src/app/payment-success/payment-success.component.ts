import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-success',
  standalone: false,

  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {
  constructor(private http: HttpClient) { }

  ngOnInit() {
    const checkoutSession = sessionStorage.getItem("checkoutSession");
    if (checkoutSession) this.sendInvoice(checkoutSession);
  }

  sendInvoice(checkoutSessionId: string) {
    const apiUrl = `https://localhost:7117/api/UserPayments/invoice/${checkoutSessionId}`;
    this.http.get(apiUrl).subscribe({
      next: (data) => {
        console.log("Fatura enviada com sucesso: ", data);
        sessionStorage.clear();
      },
      error: (error) => {
        console.error("Erro ao enviar a fatura: ", error);
        sessionStorage.clear();
      }
    })
  }
}
