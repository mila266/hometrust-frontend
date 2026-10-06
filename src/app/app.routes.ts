import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cliente' },
  {
    path: 'cliente',
    loadComponent: () => import('./pages/cliente/cliente.component').then(m => m.ClienteComponent)
  },
  {
    path: 'tecnico',
    loadComponent: () => import('./pages/tecnico/tecnico.component').then(m => m.TecnicoComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  { path: '**', redirectTo: 'cliente' }
];
