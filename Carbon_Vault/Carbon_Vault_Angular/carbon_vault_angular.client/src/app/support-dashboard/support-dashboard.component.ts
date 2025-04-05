import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-support-dashboard',
  standalone: false,

  templateUrl: './support-dashboard.component.html',
  styleUrl: './support-dashboard.component.css'
})
export class SupportDashboardComponent {
  @Input() TotalTickets!: number;
  @Input() TotalOpenTickets!: number;
  @Input() TotalClosedTickets!: number;
}
