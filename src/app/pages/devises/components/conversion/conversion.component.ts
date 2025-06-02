import { Component, OnInit } from '@angular/core';
import { DeviseService } from '../../services/devise.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Devise } from '../../models/devise.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-conversion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './conversion.component.html',
  styleUrls: ['./conversion.component.css']
})
export class ConversionComponent implements OnInit {
  montant: number = 0;
  from: string = '';
  to: string = '';
  result?: number;
  error = '';
  devises: Devise[] = [];

  constructor(
    private deviseService: DeviseService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDevises();
    this.route.queryParams.subscribe(params => {
      if (params['from']) {
        this.from = params['from'].toUpperCase();
      }
    });
  }

  loadDevises(): void {
    this.deviseService.getAllDevises().subscribe({
      next: (devises) => this.devises = devises,
      error: (err) => this.error = err.message
    });
  }

  convert(): void {
    this.error = '';
    this.result = undefined;

    if (this.montant <= 0) {
      this.error = 'Le montant doit être supérieur à zéro.';
      this.snackBar.open(this.error, 'Fermer', { duration: 3000 });
      return;
    }
    if (!this.from || !this.to) {
      this.error = 'Veuillez sélectionner les devises de conversion.';
      this.snackBar.open(this.error, 'Fermer', { duration: 3000 });
      return;
    }

    this.deviseService.convert(this.montant, this.from.toUpperCase(), this.to.toUpperCase()).subscribe({
      next: (res) => {
        this.result = res;
        this.snackBar.open('Conversion réussie', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de la conversion';
        this.snackBar.open(this.error, 'Fermer', { duration: 3000 });
      }
    });
  }
}

