import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Interface que representa um item de breadcrumb.
 * 
 * @property {string} label - Nome legível do breadcrumb.
 * @property {string} url - URL parcial correspondente.
 */
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

  /**
 * Injeta os serviços necessários para monitorizar a navegação e aceder às rotas ativas.
 * 
 * @param {Router} router - Serviço Angular para escutar eventos de navegação.
 * @param {ActivatedRoute} route - Fornece acesso à árvore de rotas ativa.
 */
  constructor(private router: Router, private route: ActivatedRoute) { }

  /**
 * Inicializa o componente e subscreve os eventos de navegação para atualizar os breadcrumbs.
 * Cada vez que ocorre uma mudança de rota, os breadcrumbs são gerados de novo com base na nova rota ativa.
 * 
 * @returns {void}
 */
  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.breadcrumbs = this.createBreadcrumbs(this.route.root);
    });
  }

  /**
 * Método recursivo que percorre a árvore de rotas ativa para construir os breadcrumbs.
 * Utiliza o valor definido em `data.breadcrumb` de cada rota como rótulo.
 * 
 * @param {ActivatedRoute} route - A rota atual a ser processada.
 * @param {string} url - URL acumulada durante a recursão (inicialmente vazia).
 * @param {Breadcrumb[]} breadcrumbs - Lista de breadcrumbs acumulada (inicialmente vazia).
 * @returns {Breadcrumb[]} Lista de breadcrumbs gerada.
 */
  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    if (!route || !route.snapshot) return breadcrumbs;

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
