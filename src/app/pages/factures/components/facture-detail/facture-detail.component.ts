import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../services/facture.service';
import { Facture } from '../../models/facture.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../login/services/auth.service';

@Component({
  selector: 'app-facture-detail',
    standalone: true,
    imports: [
    CommonModule ,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    MatTableModule,

  ],
  templateUrl: './facture-detail.component.html',
  styleUrls: ['./facture-detail.component.css']
})
export class FactureDetailComponent implements OnInit {
  facture: Facture | null = null;
  factureStats: { total: number, montantPaye: number, resteAPayer: number, lignes: number } | null = null;
  ligneColumns: string[] = ['produitID', 'quantity', 'price', 'total'];
  loading = false;
  errorMessage = '';
  role: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private factureService: FactureService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.role = this.authService.getRole();
    this.loadFacture(id);
  }

  loadFacture(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.factureService.getFacture(id).subscribe({
      next: (facture) => {
        this.facture = facture;
        this.loading = false;
        this.factureService.getFactureStats(id).subscribe(stats => this.factureStats = stats);
      },
      error: (err) => {
        console.error('Erreur chargement:', err);
        this.errorMessage = 'Impossible de charger la facture.';
        this.toastr.error(this.errorMessage, 'Erreur');
        this.loading = false;
      }
    });
  }
}