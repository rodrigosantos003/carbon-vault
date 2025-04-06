import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth-service.service';

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

  constructor(private cartService: CartService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.updateCart();
  }

  incrementQuantity(itemId: number) {
    this.cartService.incrementQuantity(itemId);
    this.updateCart();
  }

  decrementQuantity(itemId: number) {
    this.cartService.decrementQuantity(itemId);
    this.updateCart();
  }

  removeItem(itemId: number) {
    this.openPopup(itemId);
  }

  deleteItem() {
    if (this.selectedItemId !== null) {
      this.cartService.removeItem(this.selectedItemId);
      this.updateCart();
    }
    this.closePopup();
  }

  updateCart() {
    this.cartItems = this.cartService.getCart();
    this.total = this.cartService.getTotal();
  }

  clearCart() {
    this.cartService.clearCart();
    this.updateCart();
  }

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
      }, error: (error) => {
        console.error('Erro ao realizar pagamento:', error);
      }
    }
    );
  }

  openPopup(itemId: number) {
    this.selectedItemId = itemId;
    const overlay = document.getElementById('modalOverlay');
    const delPopup = document.getElementById('delete');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

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
