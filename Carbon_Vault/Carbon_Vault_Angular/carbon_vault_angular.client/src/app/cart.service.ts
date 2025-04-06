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

  /**
 * Construtor que injeta as dependências necessárias para o funcionamento do serviço,
 * incluindo os serviços de cookies, autenticação, alertas, roteamento e comunicação HTTP.
 * 
 * @param {CookieService} cookieService - Serviço responsável pela gestão de cookies.
 * @param {AuthService} authService - Serviço responsável pela autenticação e gestão de tokens de usuário.
 * @param {Router} router - Serviço de roteamento para navegação entre páginas.
 * @param {AlertsService} alerts - Serviço para exibição de alertas de sucesso, erro e informações.
 * @param {HttpClient} http - Serviço para realizar requisições HTTP.
 */
  constructor(private cookieService: CookieService, private authService: AuthService, private router: Router, private alerts: AlertsService, private http: HttpClient) { }

  /**
   * Obtém o ID do utilizador atual.
   * 
   * @returns {string} - O ID do utilizador ou `'guest'` caso não esteja autenticado.
   */
  private getUserId(): string {
    // Simula a obtenção do ID do utilizador do localStorage ou JWT
    return this.authService.getUserId() || 'guest';
  }

  /**
   * Gera o nome do cookie baseado no ID do utilizador.
   * 
   * @returns {string} - Nome do cookie associado ao carrinho.
   */
  private getCartCookieName(): string {
    return `user_cart_${this.getUserId()}`;
  }

  /**
   * Obtém o conteúdo atual do carrinho a partir dos cookies.
   * 
   * @returns {any[]} - Lista de itens no carrinho.
   */
  getCart(): any[] {
    const cart = this.cookieService.get(this.getCartCookieName());
    return cart ? JSON.parse(cart) : [];
  }

  /**
   * Guarda o estado atual do carrinho nos cookies.
   * 
   * @param {any[]} cartItems - Lista de itens a guardar.
   */
  saveCart(cartItems: any[]) {
    this.cookieService.set(this.getCartCookieName(), JSON.stringify(cartItems), { expires: 365, path: '/' });
  }

  /**
   * Carrega os itens do carrinho a partir do cookie.
   * 
   * @returns {any[]} - Lista de itens no carrinho.
   */
  loadCart(): any[] {
    let cart = this.getCart();
    return cart;
  }

  /**
   * Adiciona um item ao carrinho após realizar validações de autenticação e regras de negócio.
   * 
   * @param {number} projectId - ID do projeto.
   * @param {number} quantity - Quantidade de créditos a adicionar.
   */
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

  /**
   * Incrementa a quantidade de um item no carrinho.
   * 
   * @param {number} itemId - ID do item a incrementar.
   */
  incrementQuantity(itemId: number) {
    let cart = this.getCart();
    const item = cart.find(i => i.id === itemId);
    if (item) {
      item.quantity++;
      this.saveCart(cart);
    }
  }

  /**
   * Diminui a quantidade de um item no carrinho (mínimo 1).
   * 
   * @param {number} itemId - ID do item a decrementar.
   */
  decrementQuantity(itemId: number) {
    let cart = this.getCart();
    const itemIndex = cart.findIndex(i => i.id === itemId);

    if (itemIndex !== -1) {
      if (cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity--;
      } else {
        /*cart.splice(itemIndex, 1); // Remove item from cart if quantity is 1*/
      }
      this.saveCart(cart);
    }
  }

  /**
   * Remove um item específico do carrinho.
   * 
   * @param {number} itemId - ID do item a remover.
   */
  removeItem(itemId: number) {
    let cart = this.getCart();
    cart = cart.filter(i => i.id !== itemId);
    this.saveCart(cart);
  }

  /**
   * Limpa completamente o carrinho do utilizador (remove o cookie).
   */
  clearCart() {
    this.cookieService.delete(this.getCartCookieName(), '/');
  }

  /**
   * Calcula o total do carrinho com base nos preços e quantidades dos itens.
   * 
   * @returns {number} - Valor total dos créditos no carrinho.
   */
  getTotal() {
    let cart = this.getCart();
    let total = 0;

    for (const item of cart) {
      total += item.price * item.quantity;
    }

    return total;
  }
}
