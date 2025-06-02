import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DeviseService } from '../../services/devise.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs';
import { Devise } from '../../models/devise.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-devise-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './devise-form.component.html',
  styleUrls: ['./devise-form.component.css']
})
export class DeviseFormComponent implements OnInit {
  deviseForm: FormGroup;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private deviseService: DeviseService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.deviseForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[A-Z]{3}$')]],
      name: ['', Validators.required],
      tauxChange: [1, [Validators.required, Validators.min(0.0001)]],
      deviseReference: [false]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isEdit = true;
          return this.deviseService.getDeviseById(+id);
        }
        return [];
      })
    ).subscribe({
      next: (devise: Devise) => {
        if (devise) {
          this.deviseForm.patchValue(devise);
        }
      },
      error: (err) => this.error = err.message
    });
  }

  submitForm(): void {
    this.error = null;
    this.successMessage = null;
    if (this.deviseForm.invalid) {
      this.deviseForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    const devise = this.deviseForm.value;
    const request = this.isEdit
      ? this.deviseService.updateDevise(+this.route.snapshot.params['id'], devise)
      : this.deviseService.createDevise(devise);
    request.subscribe({
      next: () => {
        this.successMessage = `Devise ${this.isEdit ? 'modifiée' : 'enregistrée'} avec succès`;
        this.loading = false;
        this.snackBar.open(this.successMessage, 'Fermer', { duration: 3000 });
        this.router.navigate(['/devises']);
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de l\'enregistrement';
        this.loading = false;
        this.snackBar.open(this.error ?? 'Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
      }
    });
  }

  navigateToDevises() {
    this.router.navigate(['/devises']);
  }
}