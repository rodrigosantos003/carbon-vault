import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: false
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  total: number = 0;

  constructor(private cartService: CartService) {}

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
    if (!confirm('Pretende eliminar o item?')) return;
    this.cartService.removeItem(itemId);
    this.updateCart();
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
    alert('Checkout não implementado ainda');
  }
}
