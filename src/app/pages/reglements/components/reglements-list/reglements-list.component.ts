import { Component, OnInit } from '@angular/core';
import { Reglement } from '../../models/reglement.model';
import { ReglementService } from '../../services/reglement.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Facture } from '../../../factures/models/facture.model';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../login/services/auth.service';

@Component({
  selector: 'app-reglements-list',
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
  templateUrl: './reglements-list.component.html',
  styleUrl: './reglements-list.component.css'
})
export class ReglementsListComponent implements OnInit {
  reglements: Reglement[] = [];
  totalElements: number = 0;
  totalPages: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  displayedColumns: string[] = ['id', 'factureId', 'montant', 'dateReglement', 'modePaiement', 'reference', 'statut', 'actions'];
  loading: boolean = false;
  role: string | null = null;

  constructor(
    private reglementService: ReglementService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.loadReglements();
  }

  loadReglements(): void {
    this.loading = true;
    this.reglementService.getReglements(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.reglements = response.reglements;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load règlements: ' + err.message, 'Error');
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReglements();
  }

  editReglement(id: number): void {
    this.router.navigate(['/reglements/edit', id]);
  }

  viewReglement(id: number): void {
    this.router.navigate(['/reglements/details', id]);
  }

  deleteReglement(id: number): void {
    if (confirm('Are you sure you want to delete this règlement?')) {
      this.loading = true;
      this.reglementService.deleteReglement(id).subscribe({
        next: () => {
          this.toastr.success('Règlement deleted successfully', 'Success');
          this.loadReglements();
        },
        error: (err) => {
          this.toastr.error('Failed to delete règlement: ' + err.message, 'Error');
          this.loading = false;
        }
      });
    }
  }

  createReglement(): void {
    this.router.navigate(['/reglements/create']);
  }
}