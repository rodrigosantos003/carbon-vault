import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth-service.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private cookieService: CookieService, private authService: AuthService, private router: Router) { }

  private getUserId(): string {
    // Simula a obtenção do ID do utilizador do localStorage ou JWT
    return this.authService.getUserId() || 'guest';
  }

  private getCartCookieName(): string {
    return `user_cart_${this.getUserId()}`;
  }

  getCart(): any[] {
    const cart = this.cookieService.get(this.getCartCookieName());
    return cart ? JSON.parse(cart) : [];
  }

  saveCart(cartItems: any[]) {
    this.cookieService.set(this.getCartCookieName(), JSON.stringify(cartItems), { expires: 365, path: '/' });
  }

  loadCart(): any[] {
    let cart = this.getCart();
    if (cart.length === 0) {
      cart = this.getDefaultProducts();
      this.saveCart(cart);
    }
    return cart;
  }

  addItem(item: any) {
    if(!this.authService.isAuthenticated())
      this.router.navigate(['/login']);

    console.log('Adding item to cart:', item);

    let cart = this.getCart();
    const existingItem = cart.find(i => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push({ ...item, quantity: item.quantity });
    }

    this.saveCart(cart);
  }

  incrementQuantity(itemId: number) {
    let cart = this.getCart();
    const item = cart.find(i => i.id === itemId);
    if (item) {
      item.quantity++;
      this.saveCart(cart);
    }
  }

  decrementQuantity(itemId: number) {
    let cart = this.getCart();
    const itemIndex = cart.findIndex(i => i.id === itemId);

    if (itemIndex !== -1) {
      if (cart[itemIndex].quantity > 1){
        cart[itemIndex].quantity--;
      } else {
        /*cart.splice(itemIndex, 1); // Remove item from cart if quantity is 1*/
      }
      this.saveCart(cart);
    }
  }


  removeItem(itemId: number) {
    let cart = this.getCart();
    cart = cart.filter(i => i.id !== itemId);
    this.saveCart(cart);
  }

  clearCart() {
    this.cookieService.delete(this.getCartCookieName(), '/');
  }

  getTotal() {
    let cart = this.getCart();
    let total = 0;

    for (const item of cart) {
      total += item.price * item.quantity;
    }

    return total;
  }

  getDefaultProducts() {
    return [
      { id: 1, image: 'https://picsum.photos/200?random=1', name: 'Teclado Mecânico RGB', price: 75.99, quantity: 1 },
      { id: 2, image: 'https://picsum.photos/200?random=2', name: 'Monitor 24" Full HD', price: 199.99, quantity: 1 },
      { id: 3, image: 'https://picsum.photos/200?random=3', name: 'Mouse Gamer 16000 DPI', price: 49.99, quantity: 1 },
      { id: 4, image: 'https://picsum.photos/200?random=4', name: 'Headset Wireless Surround', price: 129.99, quantity: 1 },
      { id: 5, image: 'https://picsum.photos/200?random=5', name: 'Cadeira Ergonômica Gamer', price: 299.99, quantity: 1 }
    ];
  }
}
