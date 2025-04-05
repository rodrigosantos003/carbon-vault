import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../auth-service.service';
import { AlertsService } from '../alerts.service';
import { environment } from '../../environments/environment';
import { downloadReportPDF } from '../services/report-generator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-reports',
  standalone: false,

  templateUrl: './user-reports.component.html',
  styleUrl: './user-reports.component.css'
})
export class UserReportsComponent {
  reports: Report[] = [];
  clientName: string = '';

  /**
   * Construtor do componente.
   * Inicializa o componente com os serviços necessários para autenticação, alertas, e navegação.
   *
   * @param http Serviço HTTP para comunicação com a API.
   * @param auth Serviço de autenticação para obter o ID do utilizador.
   * @param alerts Serviço de alertas para mostrar mensagens de sucesso ou erro.
   * @param router Serviço de navegação para redirecionar o utilizador.
   */
  constructor(private http: HttpClient, private auth: AuthService, private alerts: AlertsService, public router: Router) { }

  /**
   * Método do ciclo de vida do Angular, chamado quando o componente é inicializado.
   * Chama os métodos `fetchReports` e `getClientName` para carregar os relatórios e o nome do utilizador.
   */
  ngOnInit() {
    this.fetchReports();
    this.getClientName();
  }

  /**
   * Método para obter o nome do cliente a partir da API.
   * Preenche a variável `clientName` com o nome do utilizador.
   */
  getClientName() {
    const url = `${environment.apiUrl}/Accounts/${this.auth.getUserId()}`;

    this.http.get(url).subscribe({
      next: (account: any) => this.clientName = account.name
    })
  }

  /**
   * Método para obter os relatórios do utilizador a partir da API.
   * Atualiza a lista de relatórios e exibe informações de carregamento ou erro.
   */
  fetchReports() {
    this.alerts.enableLoading("A carregar relatórios");

    const url = `${environment.apiUrl}/Reports/User/${this.auth.getUserId()}`;

    this.http.get<Report[]>(url, { headers: this.auth.getHeaders() }).subscribe({
      next: (data) => {
        this.reports = data = data.map(r => {
          return {
            ...r,
            stateText: r.reportState === 0 ? "Pendente" : r.reportState === 1 ? "Em análise" : "Concluído"
          };
        });
        this.alerts.disableLoading();
      },
      error: (e) => {
        this.alerts.disableLoading();

        if (e.status === 404) {
          this.alerts.enableInfo("Não existem relatórios para apresentar");
        } else if (e.status === 500) {
          this.alerts.enableError("Erro ao carregar relatórios");
        } else {
          this.alerts.enableError("Ocorreu um erro inesperado.");
        }
      }
    });
  }

  /**
   * Método para descarregar um relatório em formato PDF.
   * Faz uma requisição à API para obter os detalhes do relatório e usa o serviço `downloadReportPDF` para gerar o PDF.
   *
   * @param id ID do relatório a ser descarregado.
   */
  downloadReport(id: number) {
    this.alerts.enableLoading("A descarregar relatório");

    const url = `${environment.apiUrl}/reports/${id}`;
    this.http.get<Report>(url, { headers: this.auth.getHeaders() }).subscribe({
      next: (data) => {
        const info = {
          client: this.clientName,
          reportText: data.text,
          reportDate: data.lastUpdate
        }
        this.alerts.disableLoading();
        downloadReportPDF(info);
      },
      error: () => {
        this.alerts.disableLoading();
        this.alerts.enableError("Erro ao descarregar relatório");
      }
    });
  }

  /**
   * Método para efetuar o pagamento de um relatório.
   * Se o relatório tiver uma URL de pagamento, abre essa URL em uma nova janela para realizar o pagamento.
   * Caso contrário, exibe uma mensagem de erro.
   *
   * @param id ID do relatório a ser pago.
   */
  payReport(id: number) {
    const url = `${environment.apiUrl}/reports/${id}`;
    this.http.get<Report>(url, { headers: this.auth.getHeaders() }).subscribe({
      next: (data) => {
        if (data.checkoutSession) {
          window.open(data.checkoutSession, "_self");
          sessionStorage.setItem("checkoutSession", data.checkoutSession);
        } else {
          this.alerts.enableError("Este relatório não possui URL de pagamento");
        }
      },
      error: () => {
        this.alerts.enableError("Erro ao gerar pagamento");
      }
    });
  }
}

/**
 * Interface que define a estrutura de um relatório.
 * Representa os dados necessários para mostrar um relatório, incluindo seu estado, texto e informações de pagamento.
 */
interface Report {
  id: number;
  lastUpdate: string;
  reportState: number;
  stateText: string;
  text: string;
  checkoutSession: string;
}
