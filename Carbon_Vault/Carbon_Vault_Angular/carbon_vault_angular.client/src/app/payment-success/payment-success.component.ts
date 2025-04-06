import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { CartService } from '../cart.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { AuthService } from '../auth-service.service';

@Component({
  selector: 'app-payment-success',
  standalone: false,

  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {
  message: string = "A processar pagamento...";
  sessionData: any;

  /**
 * Construtor do componente `PaymentSuccessComponent`.
 * Inicializa o componente com os serviços necessários para comunicação HTTP, manipulação do carrinho, navegação, alertas e autenticação do utilizador.
 * 
 * @param http Serviço para realizar requisições HTTP.
 * @param cartService Serviço para manipulação do carrinho de compras.
 * @param router Serviço de navegação do Angular.
 * @param authService Serviço de autenticação do utilizador.
 * @param route Serviço para aceder os parâmetros da rota.
 */
  constructor(private http: HttpClient, private cartService: CartService, public router: Router, private authService: AuthService, private route: ActivatedRoute) { }

  /**
 * Método que é executado durante a inicialização do componente.
 * - Limpa o carrinho de compras.
 * - Verifica o tipo de pagamento realizado (`credits` ou `report`).
 * - Executa a ação apropriada dependendo do tipo de pagamento.
 */
  ngOnInit() {
    const checkoutSession = sessionStorage.getItem("checkoutSession");

    if (checkoutSession) {
      const type = this.route.snapshot.paramMap.get('type');

      if (type == "credits") {
        this.http.get(`${environment.apiUrl}/UserPayments/session/${checkoutSession}`, { headers: this.authService.getHeaders() }).subscribe({
          next: () => {
            let headers = this.authService.getHeaders();
            headers = headers.append('Content-Type', 'application/json');
            this.cartService.getCart().forEach(item => {
              this.http.put(`${environment.apiUrl}/Projects/sell-credits/${item.id}`, JSON.stringify(item.quantity), { headers: headers }).subscribe();
            });
            this.cartService.clearCart();
          },
          complete: () => this.sendInvoice(checkoutSession),
          error: () => this.message = "Erro ao processar pagamento"
        });
      }
      else if (type == "report") {
        this.updateReport(checkoutSession);
      }
    }
  }

  /**
 * Atualiza o estado do relatório após o pagamento bem-sucedido.
 * - Se o pagamento for relacionado a um relatório, a função realiza uma requisição PUT para atualizar o estado do relatório para "concluído".
 * 
 * @param checkoutSession ID da sessão de checkout.
 */
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
        error: () => this.message = "Erro ao atualizar relatório"
      });
    }
  }

  /**
 * Envia a fatura para o utilizador após o pagamento bem-sucedido.
 * - Faz uma requisição GET para enviar a fatura associada à sessão de checkout.
 * - Mostra um alerta de sucesso ou erro baseado na resposta da API.
 * 
 * @param checkoutSessionId ID da sessão de checkout.
 */
  sendInvoice(checkoutSessionId: string) {
    const apiUrl = `${environment.apiUrl}/UserPayments/invoice/${checkoutSessionId}/send`;
    this.http.get(apiUrl).subscribe({
      next: () => {
        this.message = "Pagamento realizado com sucesso!"
        sessionStorage.clear();
      },
      error: () => {
        this.message = "Erro ao enviar fatura"
        sessionStorage.clear();
      }
    });
  }
}
