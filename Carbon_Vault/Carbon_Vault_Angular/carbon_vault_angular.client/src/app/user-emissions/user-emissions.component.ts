import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-emissions',
  standalone: false,

  templateUrl: './user-emissions.component.html',
  styleUrl: './user-emissions.component.css'
})
export class UserEmissionsComponent {
  emissionsForm: FormGroup;

  totalEmissions: number = 0;

  constructor(private fb: FormBuilder) {
    this.emissionsForm = this.fb.group({
      electricity: ['', [Validators.required]],
      petrol: ['', [Validators.required]],
      diesel: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.emissionsForm.valueChanges.subscribe((changes) => {
      this.totalEmissions = this.calculateEmissions(changes);
    })
  }

  onSubmit() {
    // TODO: Save emissions data
  }

  calculateEmissions(formData: { electricity: number, petrol: number, diesel: number }) {
    const electricityEquivalent = formData.electricity * 0.189;
    const petrolEquivalent = formData.petrol * 0.00231;
    const dieselEquivalent = formData.diesel * 0.00268;

    return electricityEquivalent + petrolEquivalent + dieselEquivalent;
  }
}
