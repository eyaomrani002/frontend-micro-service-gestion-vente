import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { Categorie } from '../../models/categorie.model';
import { CategorieService } from '../../services/categorie.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-categories-list',
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
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css']
})
export class CategoriesListComponent implements OnInit {
  dataSource = new MatTableDataSource<Categorie>([]);
  displayedColumns: string[] = ['id', 'name', 'description', 'actions'];
  loading = false;
  errorMessage = '';
  hasData = false;

  constructor(private categorieService: CategorieService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';
    this.categorieService.getCategories().subscribe({
      next: (categories) => {
        this.dataSource.data = categories;
        this.hasData = categories.length > 0;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur lors du chargement des catégories';
        this.toastr.error(this.errorMessage, 'Erreur');
        this.loading = false;
        this.hasData = false;
      }
    });
  }

  deleteCategorie(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
      this.categorieService.deleteCategorie(id).subscribe({
        next: () => {
          this.toastr.success('Catégorie supprimée avec succès', 'Succès');
          this.loadCategories();
        },
        error: (err) => {
          const msg = err.message || 'Erreur lors de la suppression';
          this.toastr.error(msg, 'Erreur');
          console.error(err);
        }
      });
    }
  }
}
