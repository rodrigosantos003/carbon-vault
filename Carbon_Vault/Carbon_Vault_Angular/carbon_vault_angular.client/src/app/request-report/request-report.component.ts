import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';
import { AlertsService } from '../alerts.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-request-report',
  standalone: false,

  templateUrl: './request-report.component.html',
  styleUrl: './request-report.component.css'
})
export class RequestReportComponent {
  requestForm: FormGroup;
  documents: File[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService, // Inject AuthService
    private alerts: AlertsService
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      files: [null, [Validators.required]]
    });
  }

  onSubmit() {
    this.requestReport();
  }

  onFileSelected(event: any) {
    this.documents = Array.from(event.target.files);
  }

  get fileNames(): string {
    return this.documents.map(file => file.name).join(', ');
  }

  requestReport() {
    const createURL = `${environment.apiUrl}/Reports`;

    const report = {
      UserID: this.authService.getUserId(),
      Text: ""
    };

    this.http.post<{
      "id": number,
      "userID": number,
      "lastUpdate": string,
      "reportState": number,
      "text": string,
      "files": []
    }>(createURL, report).subscribe({
      next: (data) => {
        this.uploadDocuments(data);
      },
      error: () => this.alerts.enableError("Erro ao criar pedido de relatório")
    });
  }

  uploadDocuments(data: any) {
    const uploadURL = `${environment.apiUrl}/Reports/${data.id}/upload`

    const formData = new FormData();
    this.documents.forEach(file => formData.append('files', file));

    this.http.post(uploadURL, formData).subscribe({
      next: () => this.payReport(data.id),
      error: () => this.alerts.enableError("Erro ao fazer upload")
    })
  }

  payReport(id: number) {
    const url = `${environment.apiUrl}/UserPayments?type=report`;

    const paymentData = {
      Items: [
        {
          Name: "Relatório Emissões",
          Description: `Relatório de emissões - ${Date.now().toLocaleString()}`,
          Price: 56.00,
          Quantity: 1
        }
      ],
      UserID: this.authService.getUserId()
    };

    this.http.post<{ message: string; checkout_session: string; payment_url: string }>(url, paymentData).subscribe({
      next: (data) => {
        this.updateReport(id, data);
      },
      error: () => this.alerts.enableError("Erro ao iniciar pagamento")
    });
  }

  updateReport(id: number, paymentData: any) {
    const reportURL = `${environment.apiUrl}/Reports/${id}`;

    const report = {
      id: id,
      userID: this.authService.getUserId(),
      checkoutSession: paymentData.payment_url,
      text: ""
    };

    this.http.put(reportURL, report, { headers: this.authService.getHeaders() }).subscribe({
      next: () => {
        window.open(paymentData.payment_url, "_self");
        sessionStorage.setItem("checkoutSession", paymentData.checkout_session);
      }
    });
  }
}
