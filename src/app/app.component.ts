import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="top">
      <div class="marca">
        <span class="logo">HT</span>
        <div>
          <strong>HomeTrust</strong>
          <small>Servicios tecnicos a domicilio</small>
        </div>
      </div>
      <nav>
        <a routerLink="/cliente" routerLinkActive="activo">Cliente</a>
        <a routerLink="/tecnico" routerLinkActive="activo">Tecnico</a>
        <a routerLink="/admin" routerLinkActive="activo">Admin</a>
      </nav>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .top {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: .8rem;
      background: #fff; border-bottom: 1px solid var(--gris-200);
      padding: .9rem 1.2rem;
    }
    .marca { display: flex; align-items: center; gap: .7rem; }
    .logo {
      width: 40px; height: 40px; border-radius: 10px;
      background: var(--azul); color: #fff; font-weight: 700;
      display: grid; place-items: center;
    }
    .marca small { display: block; color: var(--gris-500); font-size: .75rem; }
    nav { display: flex; gap: .3rem; }
    nav a {
      text-decoration: none; color: var(--gris-700);
      padding: .5rem 1rem; border-radius: 8px; font-weight: 600; font-size: .88rem;
    }
    nav a.activo { background: var(--azul); color: #fff; }
    main { max-width: 1000px; margin: 0 auto; padding: 1.4rem 1.2rem 3rem; }
  `]
})
export class AppComponent {}
