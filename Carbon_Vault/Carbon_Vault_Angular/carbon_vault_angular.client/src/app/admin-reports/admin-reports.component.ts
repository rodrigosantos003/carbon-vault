import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../auth-service.service';
import { AlertsService } from '../alerts.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import JSZip from 'jszip';
import { saveAs } from "@progress/kendo-file-saver"

@Component({
  selector: 'app-admin-reports',
  standalone: false,

  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.css'
})
export class AdminReportsComponent {
  reports: Report[] = [];
  selectedReport: Report = { id: 0, lastUpdate: "", checkoutSession: "", text: "", reportState: 0, userID: 0 };
  reportText: string = "";
  pendingReportsCount: number = 0;
  doneReportsCount: number = 0;
  constructor(private http: HttpClient, private auth: AuthService, private alerts: AlertsService, public router: Router) { }

  ngOnInit() {
    this.fetchReports();
  }

  fetchReports() {
    this.alerts.enableLoading("A carregar relatórios");

    const url = `${environment.apiUrl}/Reports`;

    this.http.get<Report[]>(url, { headers: this.auth.getHeaders() }).subscribe({
      next: (data) => {
        this.reports = data.filter(r => r.reportState === 1);
        this.pendingReportsCount = data.filter(r => r.reportState === 1).length;
        this.doneReportsCount = data.filter(r => r.reportState === 2).length;

        this.alerts.disableLoading();
      },
      error: () => {
        this.alerts.disableLoading();
        this.alerts.enableError("Erro ao carregar relatórios");
      }
    });
  }

  downloadFiles(id: number) {
    this.alerts.enableLoading("A descarregar ficheiros");

    const url = `${environment.apiUrl}/reports/${id}/files`;
    this.http.get<ReportFile[]>(url, { headers: this.auth.getHeaders() }).subscribe({
      next: (files) => {
        if (files.length == 0) {
          this.alerts.disableLoading();
          this.alerts.enableError("Nenhum ficheiro disponível para download");
          return;
        }

        this.createZip(files);
      },
      error: () => {
        this.alerts.disableLoading();
        this.alerts.enableError("Erro ao descarregar ficheiros");
      }
    });
  }

  private async createZip(files: ReportFile[]) {
    const zip = new JSZip();
    const filePromises = files.map(file => this.fetchFile(file, zip));

    Promise.all(filePromises).then(() => {
      zip.generateAsync({ type: 'blob' }).then(blob => {
        saveAs(blob, `ficheiros_${Date.now().toLocaleString()}.zip`);

        setTimeout(() => {
          this.alerts.disableLoading();
        }, 3000);
      });
    }).catch(() => {
      this.alerts.enableError("Erro ao criar o ficheiro ZIP.");
    });
  }

  private async fetchFile(file: ReportFile, zip: JSZip) {
    try {
      const response = await fetch(file.filePath);
      const blob = await response.blob();
      zip.file(file.fileName, blob);
    } catch (error) {
      console.error(`Erro ao obter ficheiro ${file.fileName}:`, error);
    }
  }

  answerReport() {
    const reportURL = `${environment.apiUrl}/Reports/${this.selectedReport.id}`;

    const report = {
      id: this.selectedReport.id,
      userID: this.selectedReport.userID,
      reportState: 2,
      text: this.reportText
    };

    this.http.put(reportURL, report, { headers: this.auth.getHeaders() }).subscribe({
      next: () => {
        this.alerts.enableSuccess("Relatório respondido com sucesso");
        this.closeAnswer();
        location.reload();
      },
      error: () => {
        this.alerts.enableError("Erro ao responder ao relatório");
        this.closeAnswer();
      }
    });
  }

  openAnswer(report: Report) {
    this.selectedReport = report;
    const overlay = document.getElementById('answerPopup');
    const delPopup = document.getElementById('answer');

    if (overlay && delPopup) {
      overlay.style.display = 'flex';
      delPopup.style.display = 'block';
    }
  }

  closeAnswer() {
    this.selectedReport = { id: 0, lastUpdate: "", checkoutSession: "", text: "", reportState: 0, userID: 0 };
    const overlay = document.getElementById('answerPopup');
    const delPopup = document.getElementById('answer');

    if (overlay && delPopup) {
      overlay.style.display = 'none';
      delPopup.style.display = 'none';
    }
  }
}

interface Report {
  id: number;
  lastUpdate: string;
  reportState: number;
  text: string;
  checkoutSession: string;
  userID: number;
}

interface ReportFile {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;
  reportId: number;
}
