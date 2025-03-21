import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { CartService } from '../cart.service';
import { Route, Router } from '@angular/router';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { AlertsService } from '../alerts.service';
import { AuthService } from '../auth-service.service';

@Component({
  selector: 'app-payment-success',
  standalone: false,

  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {
  sessionData: any;
  constructor(private http: HttpClient, private cartService: CartService, public router: Router, private alerts: AlertsService, private authService: AuthService) { }

  ngOnInit() {
    this.cartService.clearCart();
    const checkoutSession = sessionStorage.getItem("checkoutSession");

    if (checkoutSession) {
      this.http.get<any>(`${environment.apiUrl}/UserPayments/session/${checkoutSession}`, { headers: this.authService.getHeaders() });
      this.sendInvoice(checkoutSession);
    }
  }

  sendInvoice(checkoutSessionId: string) {
    const apiUrl = `${environment.apiUrl}/UserPayments/invoice/${checkoutSessionId}/send`;
    this.http.get(apiUrl).subscribe({
      next: (data) => {
        this.alerts.enableSuccess("Fatura enviada com sucesso");
        sessionStorage.clear();
      },
      error: (error) => {
        console.error("Erro ao enviar a fatura: ", error);
        this.alerts.enableError("Erro ao enviar a fatura");
        sessionStorage.clear();
      }
    })
  }
}
