import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { Produit } from '../../models/produit.model';
import { ProduitService } from '../../services/produit.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../login/services/auth.service';

@Component({
  selector: 'app-produits-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './produits-list.component.html',
  styleUrls: ['./produits-list.component.css']
})
export class ProduitsListComponent implements OnInit, OnDestroy {
  dataSource = new MatTableDataSource<Produit>([]);
  displayedColumns: string[] = ['id', 'name', 'price', 'quantity', 'categorie', 'actions'];
  loading = false;
  errorMessage = '';
  hasData = false;
  private subscription: Subscription = new Subscription();
  role: string | null = null;

  constructor(private produitService: ProduitService, private toastr: ToastrService, private authService: AuthService) { }

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;
    this.errorMessage = '';
    this.subscription.add(
      this.produitService.produits$.subscribe({
        next: (produits) => {
          console.log('Produits reçus:', produits);
          this.dataSource.data = produits;
          this.hasData = produits.length > 0;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur chargement:', err);
          this.errorMessage = 'Impossible de charger les produits. Vérifiez la connexion au serveur.';
          this.toastr.error(this.errorMessage, 'Erreur');
          this.hasData = false;
          this.loading = false;
        }
      })
    );
  }

  deleteProduit(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.produitService.deleteProduit(id).subscribe({
        next: () => {
          this.produitService.refreshProduits(); // Refresh after deletion
          this.toastr.success('Produit supprimé avec succès', 'Succès');
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.toastr.error('Erreur lors de la suppression', 'Erreur');
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Prevent memory leaks
  }
}