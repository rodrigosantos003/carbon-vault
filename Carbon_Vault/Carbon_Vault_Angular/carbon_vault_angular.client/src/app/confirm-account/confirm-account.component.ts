import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-confirm-account',
  standalone: true,
  templateUrl: './confirm-account.component.html',
  imports: [CommonModule],
  styleUrls: ['./confirm-account.component.css']
})
export class ConfirmAccountComponent implements OnInit {
  confirmationStatus: string = 'Processing...';

  /**
 * Injeta os serviços necessários para acesso ao router, título da página e chamadas à API.
 *
 * @param route A rota atual, usada para obter o token da query string.
 * @param router Permite redirecionar o utilizador após confirmação.
 * @param titleService Permite definir o título da página.
 * @param http Serviço HTTP para realizar o pedido de confirmação da conta.
 */
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private titleService: Title,
    private http: HttpClient
  ) { }

  /**
 * Executado ao iniciar o componente.
 * 
 * - Obtém o token de confirmação da URL.
 * - Envia pedido GET à API para confirmar a conta.
 * - Atualiza a interface com o estado de sucesso ou erro.
 * - Redireciona o utilizador para o login após confirmação bem-sucedida.
 * - Define o título da página como "Carbon Vault | Confirmar conta".
 */
  ngOnInit(): void {

    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {

      this.http
        .get(`${environment.apiUrl}/Accounts/Confirm?token=${token}`)
        .subscribe({
          next: () => {
            this.confirmationStatus = 'Conta confirmada com sucesso!';

            setTimeout(() => this.router.navigate(['/login']), 3000);
          },
          error: () => {
            this.confirmationStatus = 'Falha ao confirmar a conta,por favor contacte o nosso suporte';
          }
        });
    } else {
      this.confirmationStatus = 'No token provided in the URL.';
    }
    this.titleService.setTitle('Carbon Vault | Confirmar conta');
  }
}
