import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AlertsService } from '../alerts.service';

@Component({
  selector: 'app-user-support',
  standalone: false,
  
  templateUrl: './user-support.component.html',
  styleUrl: './user-support.component.css'
})
export class UserSupportComponent {
  supportForm: FormGroup;

  constructor(private fb: FormBuilder, private alerts: AlertsService) {
    this.supportForm = this.fb.group({
      titulo: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      descricao: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.supportForm.valid) {
      this.alerts.enableSuccess("Ticket submetido com sucesso!");

      const formData = this.supportForm.value;
      console.log("Form Data: \n" + formData.titulo + ", " + formData.categoria + ", " + formData.descricao);

    } else {
      this.alerts.enableError("Ocorreu um erro ao submeter o Ticket");
    }
  }
}
