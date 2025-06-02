import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReglementService } from '../../services/reglement.service';
import { ToastrService } from 'ngx-toastr';
import { Reglement, Facture } from '../../models/reglement.model';
import { forkJoin } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-reglement-form',
  imports: [RouterModule,ReactiveFormsModule,CommonModule,MatSelectModule,MatIconModule,MatFormFieldModule,MatInputModule,MatCardModule,MatButtonModule,MatProgressSpinnerModule],
  templateUrl: './reglement-form.component.html',
  styleUrl: './reglement-form.component.css'
})
export class ReglementFormComponent implements OnInit {
  reglementForm: FormGroup;
  isEdit = false;
  reglementId?: number;
  factures: Facture[] = [];
  devises: string[] = ['MAD', 'EUR', 'USD','TND']; // Fallback if devise service fails
  statuts = ['COMPLET', 'PARTIEL', 'ANNULE'];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private reglementService: ReglementService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.reglementForm = this.fb.group({
      factureId: ['', [Validators.required, Validators.min(1)]],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      dateReglement: ['', Validators.required],
      modePaiement: ['TND', Validators.required],
      reference: ['', Validators.required],
      statut: ['COMPLET', Validators.required]
    });
  }

  ngOnInit(): void {
    this.reglementId = +this.route.snapshot.paramMap.get('id')!;
    if (this.reglementId) {
      this.isEdit = true;
      this.loadReglement(this.reglementId);
    }
    this.loadFactures();
    this.loadDevises();
  }

  loadReglement(id: number): void {
    this.loading = true;
    this.reglementService.getReglement(id).subscribe({
      next: (reglement) => {
        this.reglementForm.patchValue({
          factureId: reglement.factureId,
          montant: reglement.montant,
          dateReglement: this.formatDate(reglement.dateReglement),
          modePaiement: reglement.modePaiement,
          reference: reglement.reference,
          statut: reglement.statut
        });
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load règlement: ' + err.message, 'Error');
        this.loading = false;
      }
    });
  }

  loadFactures(): void {
    this.reglementService.getAllFactures().subscribe({
      next: (factures) => {
        this.factures = factures;
      },
      error: (err) => {
        this.toastr.error('Failed to load factures: ' + err.message, 'Error');
      }
    });
  }

  loadDevises(): void {
    this.reglementService.getDevises().subscribe({
      next: (devises) => {
        this.devises = devises;
      },
      error: (err) => {
        this.toastr.warning('Using fallback devise list: ' + err.message, 'Warning');
      }
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  submitForm(): void {
    if (this.reglementForm.invalid) {
      this.reglementForm.markAllAsTouched();
      this.error = 'Veuillez corriger les erreurs du formulaire.';
      return;
    }

    const reglement: Reglement = this.reglementForm.value;
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const request = this.isEdit
      ? this.reglementService.updateReglement(this.reglementId!, reglement)
      : this.reglementService.createReglement(reglement);

    request.subscribe({
      next: () => {
        this.successMessage = `Règlement ${this.isEdit ? 'modifié' : 'créé'} avec succès.`;
        this.toastr.success(this.successMessage, 'Succès');
        this.router.navigate(['/reglements']);
        this.loading = false;
      },
      error: (err) => {
        this.error = `Erreur lors de la ${this.isEdit ? 'modification' : 'création'} du règlement : ${err.message}`;
        this.toastr.error(this.error, 'Erreur');
        this.loading = false;
      }
    });
  }
}
