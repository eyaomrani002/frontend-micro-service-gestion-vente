import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../login/services/auth.service';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatButtonModule,MatIconModule,MatTooltipModule,MatProgressSpinnerModule,NgbPaginationModule],
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.css'] // Corrige l'extension du fichier de style
})
export class ClientsListComponent implements OnInit {
  clients$!: Observable<Client[]>;
  displayedColumns: string[] = ['id', 'name', 'email', 'adresse', 'actions'];
  role: string | null = null;

  constructor(private clientService: ClientService, private toastrService: ToastrService, private authService: AuthService) { }

  ngOnInit(): void {
    this.clients$ = this.clientService.getClients();
    this.role = this.authService.getRole();
  }

deleteClient(id: number): void {
  if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
    this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.clients$ = this.clientService.getClients();
        this.toastrService.success('Client supprimé avec succès', 'Succès');
      },
      error: () => this.toastrService.error('Erreur lors de la suppression', 'Erreur')
    });
  }
}
}