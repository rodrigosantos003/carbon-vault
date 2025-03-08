import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { HttpClient } from '@angular/common/http';

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

  constructor(private cartService: CartService, private http: HttpClient) {}

  ngOnInit() {
    this.updateCart();
  }

  addItem(item: any) {
    this.cartService.addItem(item);
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

  updateCart(){
    this.cartItems = this.cartService.getCart();
    this.total = this.cartService.getTotal();
  }

  clearCart() {
    this.cartService.clearCart();
    this.updateCart();
  }

  //TODO
  checkout() {
    //alert('Checkout não implementado ainda');
    const apiUrl = 'https://localhost:7117/api/UserPayments';
    const paymentData = {
      items: this.cartService.getCart()
    };

    this.http.post(apiUrl, paymentData).subscribe(
      response => console.log('Pagamento realizado com sucesso:', response),
      error => console.error('Erro ao realizar pagamento:', error)
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
