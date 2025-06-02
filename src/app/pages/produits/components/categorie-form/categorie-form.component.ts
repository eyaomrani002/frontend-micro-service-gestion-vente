import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategorieService } from '../../services/categorie.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Categorie } from '../../models/categorie.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-categorie-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './categorie-form.component.html',
  styleUrls: ['./categorie-form.component.css']
})
export class CategorieFormComponent implements OnInit {
  categorieForm!: FormGroup;
  categorieId?: number;
  isEditMode = false;
  loading = false;
  error = '';
  errorDetails?: string; // Ajouté pour afficher les détails techniques
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private categorieService: CategorieService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.categorieId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.categorieId;

    this.categorieForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });

    if (this.isEditMode) {
      this.loadCategorie();
    }
  }

  loadCategorie(): void {
    if (!this.categorieId) return;

    this.loading = true;
    this.error = '';
    this.errorDetails = undefined;
    this.categorieService.getCategorie(this.categorieId).subscribe({
      next: (categorie) => {
        this.categorieForm.patchValue({
          name: categorie.name,
          description: categorie.description
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la catégorie.';
        this.errorDetails = err?.message || '';
        this.toastr.error(this.error, 'Erreur');
        this.loading = false;
        console.error('Erreur lors du chargement de la catégorie (console):', err);
      }
    });
  }
onCancel(): void {
  this.router.navigate(['/produits/categories']);
}

  onSubmit(): void {
    if (this.categorieForm.invalid) {
      this.error = 'Veuillez corriger les erreurs dans le formulaire.';
      this.errorDetails = undefined;
      this.toastr.error(this.error, 'Erreur');
      return;
    }
    this.error = '';
    this.errorDetails = undefined;
    this.loading = true;
    const categorieData: Categorie = this.categorieForm.value;
    if (this.isEditMode && this.categorieId) {
      this.categorieService.updateCategorie(this.categorieId, categorieData).subscribe({
        next: () => {
          this.successMessage = 'Catégorie mise à jour avec succès.';
          this.errorDetails = undefined;
          this.loading = false;
          this.router.navigate(['/produits/categories']);
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de la catégorie.';
          this.errorDetails = err?.message || '';
          this.toastr.error(this.error, 'Erreur');
          this.loading = false;
        }
      });
    } else {
      this.categorieService.createCategorie(categorieData).subscribe({
        next: () => {
          this.successMessage = 'Catégorie créée avec succès.';
          this.errorDetails = undefined;
          this.loading = false;
          this.router.navigate(['/produits/categories']);
        },
        error: (err) => {
          this.error = 'Erreur lors de la création de la catégorie.';
          this.errorDetails = err?.message || '';
          this.toastr.error(this.error, 'Erreur');
          this.loading = false;
        }
      });
    }
  }
}
