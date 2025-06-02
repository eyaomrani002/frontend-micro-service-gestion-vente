import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProduitService } from '../../services/produit.service';
import { CategorieService } from '../../services/categorie.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Produit, Categorie } from '../../models/produit.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './produit-form.component.html',
  styleUrls: ['./produit-form.component.css']
})
export class ProduitFormComponent implements OnInit {
  produitForm!: FormGroup;
  produitId?: number;
  isEditMode = false;
  loading = false;
  error = '';
  successMessage = '';
  categories: Categorie[] = [];
  categories$!: Observable<Categorie[]>;

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.produitForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      categorie: [''],
      version: [0, Validators.required]
    });

    // Charger la liste des catégories dans le tableau
    this.categorieService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: () => this.categories = []
    });
    this.categories$ = this.categorieService.getCategories();

    this.produitId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.produitId) {
      this.isEditMode = true;
      this.loadProduit(this.produitId);
    }
  }

  loadProduit(id: number): void {
    this.loading = true;
    this.produitService.getProduit(id).subscribe({
      next: (produit) => {
        console.log('Produit chargé:', produit);
        this.produitForm.patchValue({
          name: produit.name,
          price: produit.price,
          quantity: produit.quantity,
          categorie: produit.categorie?.id || '',
          version: produit.version ?? 0
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement:', err);
        this.error = 'Erreur lors du chargement du produit';
        this.toastr.error(this.error, 'Erreur');
        this.loading = false;
      }
    });
  }

onSubmit(): void {
  if (this.produitForm.invalid) {
    this.error = 'Veuillez corriger les erreurs dans le formulaire.';
    this.toastr.error(this.error, 'Erreur');
    return;
  }
  this.error = '';
  this.loading = true;
  const formValue = this.produitForm.value;
  
  // Préparation des données pour l'API
  const produitData: any = {
    name: formValue.name,
    price: Number(formValue.price),
    quantity: Number(formValue.quantity),
    version: Number(formValue.version)
  };

  // Ajout de la catégorie seulement si elle est sélectionnée
  if (formValue.categorie) {
    produitData.categorie = {
      id: Number(formValue.categorie)
      // Vous pouvez ajouter name et description si nécessaire
    };
  }

  console.log('Produit envoyé:', produitData); // Debug

  if (this.isEditMode && this.produitId) {
    this.produitService.updateProduit(this.produitId, produitData).subscribe({
      next: () => {
        this.successMessage = 'Produit mis à jour avec succès.';
        this.toastr.success(this.successMessage, 'Succès');
        this.loading = false;
        this.produitService.refreshProduits(); // Ajout : refresh automatique de la liste
        this.router.navigate(['/produits']); // Redirige vers la liste pour voir le refresh
      },
      error: (err) => {
        console.error('Erreur mise à jour:', err); // Debug
        if (err.status === 409) {
          this.error = 'Conflit de version : le produit a été modifié. Veuillez recharger.';
        } else {
          this.error = err.error?.message || 'Erreur lors de la mise à jour du produit.';
        }
        this.toastr.error(this.error, 'Erreur');
        this.loading = false;
      }
    });
  } else {
    this.produitService.createProduit(produitData).subscribe({
      next: (produit) => {
        this.successMessage = 'Produit créé avec succès.';
        this.toastr.success(this.successMessage, 'Succès');
        this.loading = false;
        this.router.navigate(['/produits', produit.id]);
      },
      error: (err) => {
        console.error('Erreur création:', err); // Debug
        this.error = err.error?.message || 'Erreur lors de la création du produit.';
        this.toastr.error(this.error, 'Erreur');
        this.loading = false;
        
        // Ajout pour mieux comprendre l'erreur 500
        if (err.status === 500) {
          console.error('Détails de l\'erreur:', err.error);
        }
      }
    });
  }
}

  onCancel(): void {
    if (this.isEditMode && this.produitId) {
      this.router.navigate(['/produits', this.produitId]);
    } else {
      this.router.navigate(['/produits']);
    }
  }
}