import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * Injeta os serviços necessários: JWT helper, Router e HTTP Client.
   * 
   * @param {JwtHelperService} jwtHelper - Serviço para manipulação de tokens JWT.
   * @param {Router} router - Serviço de navegação do Angular.
   * @param {HttpClient} http - Serviço HTTP para chamadas à API.
   */
  constructor(private jwtHelper: JwtHelperService, private router: Router, private http: HttpClient) { }

  /**
   * Verifica se o utilizador está autenticado com base na existência e validade do token JWT.
   * 
   * @returns {boolean} - `true` se o token existir e não estiver expirado, `false` caso contrário.
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  /**
   * Termina a sessão do utilizador removendo o token do `localStorage` e redirecionando para a página inicial.
   * 
   * @returns {void}
   */
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  /**
   * Obtém o ID do utilizador autenticado a partir do token JWT decodificado.
   * 
   * @returns {string} - O ID do utilizador (claim `nameid`) ou string vazia se o token não existir.
   */
  getUserId(): string {
    const token = localStorage.getItem('token');
    if (token === null) {
      return '';
    }
    const decodedToken = this.jwtHelper.decodeToken(token);

    return decodedToken['nameid'];
  }

  /**
   * Constrói os headers HTTP com o token JWT e o ID do utilizador, para serem usados em chamadas autenticadas à API.
   * 
   * @returns {HttpHeaders} - Cabeçalhos HTTP com os campos `Authorization` e `userID`.
   */
  getHeaders() {
    const token = localStorage.getItem('token');
    const userId = this.getUserId();

    console.log("Token: ", token);
    console.log("User ID: ", userId);

    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'userID': userId
    });

    return headers;
  }

  /**
   * Obtém o papel (role) do utilizador a partir da API, com base no seu ID.
   * 
   * @returns {Promise<number>} - Promessa que resolve com o valor do `role` do utilizador.
   */
  getUserRole(): Promise<number> {
    return new Promise((resolve, reject) => {
      const userId = this.getUserId();
      if (!userId) {
        reject('User ID not found.');
        return;
      }

      this.http.get<any>(`${environment.apiUrl}/accounts/${userId}`).subscribe(
        (data) => resolve(data.role),
        (error) => {
          console.error('Error fetching user role:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Verifica se o utilizador tem o papel de `Support` (3) ou `Admin` (1).
   * 
   * @returns {Promise<boolean>} - Promessa que resolve com `true` se for suporte ou admin, `false` caso contrário.
   */
  isSupportOrAdmin(): Promise<boolean> {
    return this.getUserRole().then((role) => role === 1 || role === 3);  // 3 = Support, 1 = Admin
  }
}
