import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReglementsListComponent } from './components/reglements-list/reglements-list.component';
import { ReglementDetailComponent } from './components/reglement-detail/reglement-detail.component';
import { ReglementFormComponent } from './components/reglement-form/reglement-form.component';

const routes: Routes = [
  { path: '', component: ReglementsListComponent },
  { path: 'create', component: ReglementFormComponent },
  { path: 'edit/:id', component: ReglementFormComponent },
  { path: 'details/:id', component: ReglementDetailComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  exports: [RouterModule]
})
export class ReglementsRoutingModule { }
