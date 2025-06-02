import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturesListComponent } from './components/factures-list/factures-list.component';
import { FactureDetailComponent } from './components/facture-detail/facture-detail.component';
import { FactureFormComponent } from './components/facture-form/facture-form.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
  { path: '', component: FacturesListComponent }, // Changed from 'factures' to '' for child routing
  { path: 'create', component: FactureFormComponent },
  { path: 'edit/:id', component: FactureFormComponent },
  { path: ':id', component: FactureDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  exports: [RouterModule]
})
export class FacturesRoutingModule { }


