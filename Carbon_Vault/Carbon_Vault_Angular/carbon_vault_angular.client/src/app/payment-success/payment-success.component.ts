import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { CartService } from '../cart.service';
import { Route, Router } from '@angular/router';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment-success',
  standalone: false,

  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {
  sessionData: any;
  constructor(private http: HttpClient, private cartService: CartService, public router: Router) { }

  ngOnInit() {
    this.cartService.clearCart();
    const checkoutSession = sessionStorage.getItem("checkoutSession");

    console.log("Session ID = " + checkoutSession);

    if (checkoutSession) {
      this.getSessionInfo(checkoutSession);
    }

    //if (checkoutSession) this.sendInvoice(checkoutSession);
  }

  getSessionInfo(sessionId: string) {
    this.http.get<any>(`${environment.apiUrl}/UserPayments/session/${sessionId}`)
      .subscribe(response => {
        this.sessionData = response;
        console.log("Payment Metadata:", this.sessionData);
      }, error => {
        console.error("Error fetching payment details:", error);
      });
  }

  sendInvoice(checkoutSessionId: string) {
    const apiUrl = `${environment.apiUrl}/UserPayments/invoice/${checkoutSessionId}`;
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

  getPaymentDetails(sessionId: string) {
    this.http.get<any>(`${environment.apiUrl}/UserPayments/GetPaymentDetails/${sessionId}`)
      .subscribe(response => {
        console.log("Payment Metadata:", response);
        console.log("User ID:", response.userId);
        console.log("Item ID:", response.itemId);
        console.log("Quantity:", response.quantity);
      }, error => {
        console.error("Error fetching payment details:", error);
      });
  }
}
