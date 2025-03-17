import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { CartService } from '../cart.service';
import { Route, Router } from '@angular/router';

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
    if (checkoutSession) this.sendInvoice(checkoutSession);
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
}
