import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Facture } from '../../../factures/models/facture.model';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    MatTableModule,    
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit {
  client?: Client;
  loading = false;
  error = '';
  chiffreAffaires: number = 0;
  resteAPayer: number = 0;
  facturesReglees: Facture[] = [];
  facturesNonReglees: Facture[] = [];
  produitsSollicites: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'ID client invalide';
      return;
    }
    this.loadClient(id);
    this.loadStatistics(id);
  }

  loadClient(id: number): void {
    this.loading = true;
    this.clientService.getClient(id).subscribe({
      next: (data) => {
        this.client = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du client';
        this.loading = false;
      }
    });
  }

  loadStatistics(id: number): void {
    this.clientService.getChiffreAffaires(id).subscribe(data => this.chiffreAffaires = data);
    this.clientService.getResteAPayer(id).subscribe(data => this.resteAPayer = data);
    this.clientService.getFacturesByStatut(id, 'PAYEE').subscribe(data => this.facturesReglees = data);
    this.clientService.getFacturesByStatut(id, 'NON_PAYEE').subscribe(data => this.facturesNonReglees = data);
    this.clientService.getProduitsSollicites(id).subscribe(data => this.produitsSollicites = data);
  }

  goToEdit(): void {
    if (this.client && this.client.id) {
      this.router.navigate(['/clients/edit', this.client.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }
}