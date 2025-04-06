import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth-service.service';
import { Router } from '@angular/router';
import { AlertsService } from './alerts.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private cookieService: CookieService, private authService: AuthService, private router: Router, private alerts: AlertsService, private http: HttpClient) { }

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
    return cart;
  }

  addItem(projectId: number, quantity: number): void {
  if (!this.authService.isAuthenticated()) {
    this.alerts.enableError("Apenas utilizadores com conta podem comprar créditos.", 5);
    return;
  }

  if (quantity < 1 || isNaN(quantity)) {
    quantity = 1;
  }

  this.authService.getUserRole().then((role) => {
    if (role != 0) {
      this.alerts.enableError("Apenas utilizadores com conta podem comprar créditos.", 5);
      return;
    }
  });

  this.http.get(`${environment.apiUrl}/projects/${projectId}`).subscribe({
    next: (projectData: any) => {
      console.log(projectData)
      console.log(this.authService.getUserId())
      if (projectData.creditsForSale < 1) {
        this.alerts.enableError("Este projeto não tem créditos disponíveis para venda, tente mais tarde.", 5);
        return;
      }

      if (quantity > projectData.creditsForSale) {
        this.alerts.enableError(`Quantidade máxima de ${projectData.creditsForSale} CC para este projeto`, 5);
        return;
      }

      if (projectData.ownerId == this.authService.getUserId()) {
        this.alerts.enableError("Não pode comprar créditos do seu próprio projeto", 5);
        return;
      }

      const item = {
        id: projectData.id,
        image: projectData.imageUrl,
        name: projectData.name,
        description: projectData.description,
        price: projectData.pricePerCredit,
        quantity,
        projectOwner: projectData.ownerId,
      };

      const cart = this.getCart();
      const existingItem = cart.find(i => i.id === item.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push(item);
      }

      this.saveCart(cart);
      this.alerts.enableSuccess("Item adicionado ao carrinho!");
    },
    error: (error) => {
      console.error("Erro ao buscar projeto:", error);
      this.alerts.enableError("Erro ao buscar informações do projeto.", 5);
    }
  });
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
}
