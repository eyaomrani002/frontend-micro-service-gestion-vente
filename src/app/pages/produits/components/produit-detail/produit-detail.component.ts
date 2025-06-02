import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Produit } from '../../models/produit.model';
import { ProduitService } from '../../services/produit.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    FormsModule,
    MatTableModule
  ],
  templateUrl: './produit-detail.component.html',
  styleUrls: ['./produit-detail.component.css']
})
export class ProduitDetailComponent implements OnInit {
  produit?: Produit;
  loading = false;
  error = '';
  ventesTotales: number = 0;
clientsCommandant: any;

  constructor(
    private route: ActivatedRoute,
    private produitService: ProduitService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'ID produit invalide';
      return;
    }
    this.loadProduit(id);
  }

  loadProduit(id: number): void {
    this.loading = true;
    this.produitService.getProduit(id).subscribe({
      next: (data) => {
        this.produit = data;
        this.loading = false;
        this.produitService.getTopVendus(100).subscribe(topVendus => {
          const vente = topVendus.find(v => v.id === id);
          this.ventesTotales = vente ? vente.quantity : 0;
        });
      },
      error: () => {
        this.error = 'Erreur lors du chargement du produit';
        this.loading = false;
      }
    });
  }

  goToEdit(): void {
    if (this.produit && this.produit.id) {
      this.router.navigate(['/produits/edit', this.produit.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/produits']);
  }
}