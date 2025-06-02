import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/components/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Consolidated default redirect  { path: 'clients', loadComponent: () => import('./pages/clients/components/clients-list/clients-list.component').then(m => m.ClientsListComponent) },

{ path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // Consolidated default redirect  { path: 'clients', loadComponent: () => import('./pages/clients/components/clients-list/clients-list.component').then(m => m.ClientsListComponent) },
{ path: 'login', component: LoginComponent },

{ path: 'produits', loadComponent: () => import('./pages/produits/components/produits-list/produits-list.component').then(m => m.ProduitsListComponent) },
  { path: 'factures', loadComponent: () => import('./pages/factures/components/factures-list/factures-list.component').then(m => m.FacturesListComponent) },
  { path: 'reglements', loadComponent: () => import('./pages/reglements/components/reglements-list/reglements-list.component').then(m => m.ReglementsListComponent) },
  { path: 'devises', loadComponent: () => import('./pages/devises/components/devises-list/devises-list.component').then(m => m.DevisesListComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'produits/categories', loadComponent: () => import('./pages/produits/components/categories-list/categories-list.component').then(m => m.CategoriesListComponent) },

  { 
    path: 'clients', 
    loadChildren: () => import('./pages/clients/clients-routing.module').then(m => m.ClientsRoutingModule)
  },
    { 
    path: 'produits', 
    loadChildren: () => import('./pages/produits/produits-routing.module').then(m => m.ProduitsRoutingModule)
  },
    
  {
    path: 'factures',
    loadChildren: () => import('./pages/factures/factures-routing.module').then(m => m.FacturesRoutingModule)
  },
  {
    path: 'reglements',
    loadChildren: () => import('./pages/reglements/reglements-routing.module').then(m => m.ReglementsRoutingModule)
  },
  {
    path: 'devises',
    loadChildren: () => import('./pages/devises/devises-routing.module').then(m => m.DevisesRoutingModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard-routing.module').then(m => m.DashboardRoutingModule)
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export { routes };