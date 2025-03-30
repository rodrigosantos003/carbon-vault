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

  constructor(private http: HttpClient, private auth: AuthService, private alerts: AlertsService, public router: Router) { }

  ngOnInit() {
    this.fetchReports();
    this.getClientName();
  }

  getClientName() {
    const url = `${environment.apiUrl}/Accounts/${this.auth.getUserId()}`;

    this.http.get(url).subscribe({
      next: (account: any) => this.clientName = account.name
    })
  }

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
      error: () => {
        this.alerts.disableLoading();
        this.alerts.enableError("Erro ao carregar relatórios");
      }
    });
  }
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

interface Report {
  id: number;
  lastUpdate: string;
  reportState: number;
  stateText: string;
  text: string;
  checkoutSession: string;
}