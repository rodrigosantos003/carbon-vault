import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized-page',
  standalone: false,
  
  templateUrl: './unauthorized-page.component.html',
  styleUrl: './unauthorized-page.component.css'
})
export class UnauthorizedPageComponent {
 constructor(private router: Router) {} 

  goToHome() {
    this.router.navigate(['/dashboard']);  
  }

}
