import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProduitsListComponent } from './components/produits-list/produits-list.component';
import { ProduitDetailComponent } from './components/produit-detail/produit-detail.component';
import { ProduitFormComponent } from './components/produit-form/produit-form.component';
import { CategoriesListComponent } from './components/categories-list/categories-list.component';
import { CategorieFormComponent } from './components/categorie-form/categorie-form.component';


const routes: Routes = [
  { path: '', component: ProduitsListComponent },              // /produits
  { path: 'create', component: ProduitFormComponent },         // /produits/create
  { path: 'edit/:id', component: ProduitFormComponent },       // /produits/edit/1
  { path: ':id', component: ProduitDetailComponent },          // /produits/1
  { path: 'categories', component: CategoriesListComponent },  // /produits/categories
  { path: 'categories/create', component: CategorieFormComponent }, // /produits/categories/create
  { path: 'categories/edit/:id', component: CategorieFormComponent } // /produits/categories/edit/1
];
@NgModule({
  imports: [RouterModule.forChild(routes),    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,],
  exports: [RouterModule]
})
export class ProduitsRoutingModule { }



