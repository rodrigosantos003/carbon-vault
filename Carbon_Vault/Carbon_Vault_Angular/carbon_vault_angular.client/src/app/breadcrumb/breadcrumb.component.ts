import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.breadcrumbs = this.createBreadcrumbs(this.route.root);
    });
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    if (!route || !route.snapshot) return breadcrumbs; // ✅ Prevent errors

    const label = route.snapshot.data['breadcrumb'];
    const path = route.snapshot.url.map(segment => segment.path).join('/');
    const nextUrl = path ? `${url}/${path}` : url;

    if (label) {
      breadcrumbs.push({ label, url: nextUrl });
    }

    for (const child of route.children) {
      return this.createBreadcrumbs(child, nextUrl, breadcrumbs);
    }

    return breadcrumbs;
  }
}
