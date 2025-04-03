import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { CartService } from '../cart.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
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
  constructor(private http: HttpClient, private cartService: CartService, public router: Router, private alerts: AlertsService, private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.cartService.clearCart();
    const checkoutSession = sessionStorage.getItem("checkoutSession");

    if (checkoutSession) {
      const type = this.route.snapshot.paramMap.get('type');
      console.log(type);

      if (type == "credits") {
        console.log("CREDITOS");
        this.http.get(`${environment.apiUrl}/UserPayments/session/${checkoutSession}`, { headers: this.authService.getHeaders() }).subscribe({
          next: () => this.sendInvoice(checkoutSession),
          error: () => this.alerts.enableError("Erro ao processar")
        });
      }
      else if (type == "report") {
        this.updateReport(checkoutSession);
      }
    }
  }

  updateReport(checkoutSession: string) {
    const id = sessionStorage.getItem("reportID")

    if (id) {
      const reportURL = `${environment.apiUrl}/Reports/${id}`;

      const report = {
        id: parseInt(id),
        userID: this.authService.getUserId(),
        reportState: 1,
        text: ""
      };

      this.http.put(reportURL, report, { headers: this.authService.getHeaders() }).subscribe({
        next: () => this.sendInvoice(checkoutSession),
        error: () => this.alerts.enableError("Erro ao processar")
      });
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
