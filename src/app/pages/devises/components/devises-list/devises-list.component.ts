import { Component, OnInit } from '@angular/core';
import { DeviseService } from '../../services/devise.service';
import { Devise } from '../../models/devise.model';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-devises-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './devises-list.component.html',
  styleUrls: ['./devises-list.component.css']
})
export class DevisesListComponent implements OnInit {
  devises: Devise[] = [];
  displayedColumns: string[] = ['code', 'name', 'tauxChange', 'deviseReference', 'actions'];
  loading = false;
  error = '';

  constructor(private deviseService: DeviseService, private router: Router) {}

  ngOnInit(): void {
    this.loadDevises();
  }

  loadDevises(): void {
    this.loading = true;
    this.error = '';
    this.deviseService.getAllDevises().subscribe({
      next: (data) => {
        this.devises = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  createDevise(): void {
    this.router.navigate(['/devises/create']);
  }

  editDevise(id: number): void {
    this.router.navigate(['/devises/edit', id]);
  }

  deleteDevise(id: number): void {
    if (confirm('Voulez-vous supprimer cette devise ?')) {
      this.deviseService.deleteDevise(id).subscribe({
        next: () => this.loadDevises(),
        error: (err) => this.error = err.message
      });
    }
  }

  convertDevise(code: string): void {
    this.router.navigate(['/devises/convert'], { queryParams: { from: code } });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/devises', id]);
  }
}