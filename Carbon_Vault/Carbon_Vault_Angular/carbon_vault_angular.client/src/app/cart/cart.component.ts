import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth-service.service';
import { AlertsService } from '../alerts.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: false
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  total: number = 0;
  selectedItemId: number | null = null;

  /**
 * Injeta os serviços necessários: carrinho, autenticação e HTTP.
 * 
 * @param cartService Serviço de gestão do carrinho.
 * @param http Serviço HTTP para chamadas à API.
 * @param authService Serviço de autenticação para obter o ID do utilizador.
 */
  constructor(private cartService: CartService, private http: HttpClient, private authService: AuthService, private alerts: AlertsService) { }

  /**
 * Inicializa o componente e atualiza o estado do carrinho.
 */
  ngOnInit() {
    this.updateCart();
  }

  /**
 * Incrementa a quantidade de um item específico no carrinho.
 * 
 * @param itemId ID do item a incrementar.
 */
  incrementQuantity(itemId: number) {
    this.cartService.incrementQuantity(itemId);
    this.updateCart();
  }

  /**
 * Diminui a quantidade de um item específico no carrinho.
 * 
 * @param itemId ID do item a decrementar.
 */
  decrementQuantity(itemId: number) {
    this.cartService.decrementQuantity(itemId);
    this.updateCart();
  }

  /**
 * Mostra o popup de confirmação para remover um item.
 * 
 * @param itemId ID do item a remover.
 */
  removeItem(itemId: number) {
    this.openPopup(itemId);
  }

  /**
 * Remove o item selecionado após confirmação via popup.
 */
  deleteItem() {
    if (this.selectedItemId !== null) {
      this.cartService.removeItem(this.selectedItemId);
      this.updateCart();
    }
    this.closePopup();
  }

  /**
 * Atualiza a lista de itens e o total do carrinho.
 */
  updateCart() {
    this.cartItems = this.cartService.getCart();
    this.total = this.cartService.getTotal();
  }

  /**
 * Remove todos os itens do carrinho.
 */
  clearCart() {
    this.cartService.clearCart();
    this.updateCart();
  }

  /**
 * Inicia o processo de pagamento com os dados atuais do carrinho.
 * Envia um POST para a API para gerar o URL de pagamento.
 * 
 * Abre a página de pagamento e armazena a sessão de checkout.
 */
  checkout() {
    const apiUrl = `${environment.apiUrl}/UserPayments?type=credits`;
    const paymentData = {
      items: this.cartService.getCart(),
      userId: this.authService.getUserId(),
    };

    this.http.post<{ message: string; checkout_session: string; payment_url: string }>(apiUrl, paymentData).subscribe({
      next: (data) => {
        window.open(data.payment_url, "_self");
        sessionStorage.setItem("checkoutSession", data.checkout_session);
      }, error: () => {
        this.alerts.enableError("Erro ao iniciar pagamento");
      }
    });
  }

  /**
 * Mostra o popup de confirmação de remover o item do carrinho.
 * 
 * @param itemId ID do item que o utilizador pretende remover.
 */
  openPopup(itemId: number) {
    this.selectedItemId = itemId;
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  /**
 * Fecha o popup de confirmação de remover o item do carrinho.
 */
  closePopup() {
    this.selectedItemId = null;
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }
}
