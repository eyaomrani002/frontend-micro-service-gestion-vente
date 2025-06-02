import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../../models/client.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,MatIconModule,MatFormFieldModule,MatInputModule,MatCardModule,MatButtonModule,MatProgressSpinnerModule],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  clientId?: number;
  isEditMode = false;
  loading = false;
  error = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', Validators.required],
      telephone: ['']
    });

    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.clientId) {
      this.isEditMode = true;
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: number): void {
    this.loading = true;
    this.clientService.getClient(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue(client);
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du client';
        this.loading = false;
      }
    });
  }

onSubmit(): void {
  if (this.clientForm.invalid) {
    this.error = 'Veuillez corriger les erreurs dans le formulaire.';
    this.toastrService.error(this.error, 'Erreur');
    return;
  }
  this.error = '';
  this.loading = true;
  const clientData: Client = this.clientForm.value;

  if (this.isEditMode && this.clientId) {
    this.clientService.updateClient(this.clientId, clientData).subscribe({
      next: () => {
        this.successMessage = 'Client mis à jour avec succès.';
        this.toastrService.success(this.successMessage, 'Succès');
        this.loading = false;
        this.router.navigate(['/clients', this.clientId]);
      },
      error: () => {
        this.error = 'Erreur lors de la mise à jour du client.';
        this.toastrService.error(this.error, 'Erreur');
        this.loading = false;
      }
    });
  } else {
    this.clientService.createClient(clientData).subscribe({
      next: () => {
        this.successMessage = 'Client créé avec succès.';
        this.toastrService.success(this.successMessage, 'Succès');
        this.loading = false;
        this.router.navigate(['/clients']);
      },
      error: () => {
        this.error = 'Erreur lors de la création du client.';
        this.toastrService.error(this.error, 'Erreur');
        this.loading = false;
      }
    });
  }
}
  onCancel(): void {
    if (this.isEditMode && this.clientId) {
      this.router.navigate(['/clients', this.clientId]);
    } else {
      this.router.navigate(['/clients']);
    }
  }

  
}