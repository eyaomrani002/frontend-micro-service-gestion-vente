import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReglementService } from '../../services/reglement.service';
import { ToastrService } from 'ngx-toastr';
import { Reglement, Facture } from '../../models/reglement.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../login/services/auth.service';

@Component({
  selector: 'app-reglement-detail',
  imports: [
    MatTableModule,    
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    RouterModule],
  templateUrl: './reglement-detail.component.html',
  styleUrl: './reglement-detail.component.css'
})
export class ReglementDetailComponent implements OnInit {
  reglement: Reglement | null = null;
  facture: Facture | null = null;
  loading = false;
  error: string | null = null;
  role: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private reglementService: ReglementService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.role = this.authService.getRole();
    this.loadReglement(id);
  }

  loadReglement(id: number): void {
    this.loading = true;
    this.reglementService.getReglement(id).subscribe({
      next: (reglement) => {
        this.reglement = reglement;
        this.loadFacture(reglement.factureId);
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load règlement: ' + err.message, 'Error');
        this.loading = false;
      }
    });
  }

  loadFacture(factureId: number): void {
    this.reglementService.getFactureById(factureId).subscribe({
      next: (facture) => {
        this.facture = facture;
      },
      error: (err) => {
        this.toastr.error('Failed to load facture: ' + err.message, 'Error');
      }
    });
  }
}
