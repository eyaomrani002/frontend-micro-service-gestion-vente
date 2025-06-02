import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DevisesListComponent } from './components/devises-list/devises-list.component';
import { ConversionComponent } from './components/conversion/conversion.component';
import { DeviseFormComponent } from './components/devise-form/devise-form.component';
import { DeviseDetailComponent } from './components/devise-detail/devise-detail.component';
const routes: Routes = [
  { path: '', component: DevisesListComponent },
  { path: 'create', component: DeviseFormComponent },
  { path: 'edit/:id', component: DeviseFormComponent },
  { path: 'convert', component: ConversionComponent },
  { path: ':id', component: DeviseDetailComponent }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  exports: [RouterModule]
})
export class DevisesRoutingModule { }

