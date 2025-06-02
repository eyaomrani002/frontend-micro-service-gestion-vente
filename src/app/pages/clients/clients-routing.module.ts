import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsListComponent } from './components/clients-list/clients-list.component';
import { ClientDetailComponent } from './components/client-detail/client-detail.component';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
  { path: '', component: ClientsListComponent },               // /clients
  { path: 'create', component: ClientFormComponent },           // /clients/create
  { path: 'edit/:id', component: ClientFormComponent },         // /clients/edit/1
  { path: ':id', component: ClientDetailComponent },            // /clients/1
];

@NgModule({
  imports: [RouterModule.forChild(routes),    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
