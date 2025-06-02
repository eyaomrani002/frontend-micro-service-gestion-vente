import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Facture } from '../../models/facture.model';
import { FactureService } from '../../services/facture.service';
import { ToastrService } from 'ngx-toastr';
import { Client } from '../../../reglements/models/reglement.model';
import { Produit } from '../../../produits/models/produit.model';
import { ClientService } from '../../../clients/services/client.service';
import { ProduitService } from '../../../produits/services/produit.service';
import { forkJoin } from 'rxjs';

const minFactureLignesValidator: ValidatorFn = (control: AbstractControl) => {
  const formArray = control as FormArray;
  return formArray.length > 0 ? null : { minFactureLignes: true };
};

@Component({
  selector: 'app-facture-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './facture-form.component.html',
  styleUrls: ['./facture-form.component.css']
})
export class FactureFormComponent implements OnInit {
  factureForm: FormGroup;
  isEdit = false;
  factureId?: number;
  error: string | null = null;
  successMessage: string | null = null;
  loading: boolean = false;
  clients: Client[] = [];
  produits: Produit[] = [];
  selectedClientName: string = '';

  constructor(
    private fb: FormBuilder,
    private factureService: FactureService,
    private clientService: ClientService,
    private produitService: ProduitService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.factureForm = this.fb.group({
      clientID: ['', [Validators.required]],
      dateFacture: ['', Validators.required],
      status: ['NON_PAYEE', Validators.required],
      total: [{ value: 0, disabled: true }],
      resteAPayer: [{ value: 0, disabled: true }],
      montantPaye: [{ value: 0, disabled: true }, [Validators.min(0)]],
      factureLignes: this.fb.array([], minFactureLignesValidator)
    });

    this.factureForm.get('status')?.valueChanges.subscribe(status => {
      this.updateFormFields(status);
    });

    this.factureLignes.valueChanges.subscribe(() => this.updateTotal());
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadProduits();
    this.factureId = +this.route.snapshot.paramMap.get('id')!;
    if (this.factureId) {
      this.isEdit = true;
      this.loadFacture(this.factureId);
    }
  }

  get factureLignes(): FormArray {
    return this.factureForm.get('factureLignes') as FormArray;
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des clients', 'Erreur');
      }
    });
  }

  loadProduits(): void {
    this.produitService.produits$.subscribe({
      next: (produits) => {
        this.produits = produits;
        console.log('Produits chargés:', this.produits);
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des produits', 'Erreur');
      }
    });
  }

  updateClientName(): void {
    const clientID = this.factureForm.get('clientID')?.value;
    const client = this.clients.find(c => c.id === clientID);
    this.selectedClientName = client ? client.name : '';
  }

  updateProduit(index: number): void {
    const ligne = this.factureLignes.at(index);
    const produitID = ligne.get('produitID')?.value;
    const produit = this.produits.find(p => p.id === produitID);
    if (produit) {
      ligne.get('price')?.setValue(produit.price);
      ligne.get('produit')?.setValue(produit);
      const maxQuantity = produit.quantity || 0;
      const currentQuantity = ligne.get('quantity')?.value || 1;
      ligne.get('quantity')?.setValue(Math.min(currentQuantity, maxQuantity));
    } else {
      ligne.get('price')?.setValue(0);
      ligne.get('produit')?.setValue(null);
      ligne.get('quantity')?.setValue(1);
    }
    this.updateTotal();
  }

  getProduitName(index: number): string {
    const ligne = this.factureLignes.at(index);
    const produitID = ligne.get('produitID')?.value;
    const produit = this.produits.find(p => p.id === produitID);
    return produit ? produit.name : '';
  }

  getMaxQuantity(index: number): number {
    const ligne = this.factureLignes.at(index);
    const produitID = ligne.get('produitID')?.value;
    const produit = this.produits.find(p => p.id === produitID);
    return produit ? produit.quantity || 0 : 0;
  }

  addFactureLigne(): void {
    const factureLigneForm = this.fb.group({
      produitID: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [{ value: 0, disabled: true }],
      produit: [null]
    });
    this.factureLignes.push(factureLigneForm);
    this.factureForm.get('factureLignes')?.updateValueAndValidity();
  }

  removeFactureLigne(index: number): void {
    this.factureLignes.removeAt(index);
    this.updateTotal();
    this.factureForm.get('factureLignes')?.updateValueAndValidity();
  }

  loadFacture(id: number): void {
    this.loading = true;
    this.factureService.getFacture(id).subscribe({
      next: (facture) => {
        this.factureForm.patchValue({
          clientID: facture.clientID,
          dateFacture: facture.dateFacture
            ? this.formatDate(
                typeof facture.dateFacture === 'string'
                  ? new Date(facture.dateFacture)
                  : facture.dateFacture
              )
            : '',
          status: facture.status,
          total: facture.total ?? 0,
          resteAPayer: facture.resteAPayer ?? 0,
          montantPaye: facture.montantPaye ?? 0
        });
        this.updateClientName();
        if (facture.factureLignes) {
          this.factureLignes.clear();
          facture.factureLignes.forEach(ligne => {
            const produit = this.produits.find(p => p.id === ligne.produitID) || null;
            this.factureLignes.push(this.fb.group({
              id: [ligne.id],
              produitID: [ligne.produitID, [Validators.required]],
              quantity: [ligne.quantity, [Validators.required, Validators.min(1)]],
              price: [{ value: ligne.price, disabled: true }],
              produit: [produit]
            }));
          });
        }
        this.updateFormFields(facture.status);
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement de la facture', 'Erreur');
        this.loading = false;
      }
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  updateFormFields(status: string): void {
    const totalControl = this.factureForm.get('total');
    const montantPayeControl = this.factureForm.get('montantPaye');

    if (status === 'NON_PAYEE') {
      montantPayeControl?.disable();
      montantPayeControl?.setValue(0);
      montantPayeControl?.clearValidators();
    } else if (status === 'PAYEE') {
      montantPayeControl?.disable();
      montantPayeControl?.setValue(totalControl?.value || 0);
      montantPayeControl?.clearValidators();
    } else if (status === 'PARTIELLEMENT_PAYEE') {
      montantPayeControl?.enable();
      montantPayeControl?.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(totalControl?.value || Infinity)
      ]);
    }

    montantPayeControl?.updateValueAndValidity();
    this.updateResteAPayer();
  }

  updateTotal(): void {
    const total = this.factureLignes.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      return sum + (quantity * price);
    }, 0);
    this.factureForm.get('total')?.setValue(total);
    this.updateResteAPayer();
  }

  updateResteAPayer(): void {
    const total = this.factureForm.get('total')?.value || 0;
    const montantPaye = this.factureForm.get('montantPaye')?.value || 0;
    const resteAPayer = total - montantPaye;
    this.factureForm.get('resteAPayer')?.setValue(resteAPayer >= 0 ? resteAPayer : 0);
  }

  submitForm(): void {
    if (this.factureForm.invalid) {
      this.factureForm.markAllAsTouched();
      this.toastr.error('Veuillez corriger les erreurs dans le formulaire', 'Erreur');
      return;
    }

    for (let i = 0; i < this.factureLignes.controls.length; i++) {
      const ligne = this.factureLignes.at(i);
      const produitID = ligne.get('produitID')?.value;
      const quantity = ligne.get('quantity')?.value;
      const produit = this.produits.find(p => p.id === produitID);
      if (produit && produit.quantity < quantity) {
        this.toastr.error(`Stock insuffisant pour ${produit.name}: disponible ${produit.quantity}, requis ${quantity}`, 'Erreur');
        return;
      }
    }

    const facture: Facture = {
      clientID: this.factureForm.get('clientID')?.value,
      dateFacture: this.factureForm.get('dateFacture')?.value,
      status: this.factureForm.get('status')?.value,
      total: this.factureForm.get('total')?.value,
      montantPaye: this.factureForm.get('montantPaye')?.value,
      resteAPayer: this.factureForm.get('resteAPayer')?.value,
      factureLignes: this.factureLignes.controls.map(control => ({
        id: control.get('id')?.value,
        produitID: control.get('produitID')?.value,
        quantity: control.get('quantity')?.value,
        price: control.get('price')?.value
      }))
    };

    if (!facture.factureLignes || facture.factureLignes.length === 0) {
      this.toastr.error('La facture doit contenir au moins une ligne de produit.', 'Erreur');
      return;
    }

    this.loading = true;
    const request = this.isEdit
      ? this.factureService.updateFacture(this.factureId!, facture)
      : this.factureService.createFacture(facture);

    request.subscribe({
      next: (response) => {
        // Appel diminution du stock pour chaque produit de la facture
        const lignes = facture.factureLignes ?? [];
        const stockRequests = lignes.map(ligne =>
          this.produitService.decreaseStock(ligne.produitID, ligne.quantity)
        );
        if (stockRequests.length > 0) {
          forkJoin(stockRequests).subscribe({
            next: () => {
              this.toastr.success(`Facture ${this.isEdit ? 'modifiée' : 'créée'} avec succès`, 'Succès');
              this.produitService.refreshProduits();
              this.router.navigate(['/factures']);
              this.loading = false;
            },
            error: (err) => {
              this.toastr.warning('Erreur lors de la diminution du stock pour un ou plusieurs produits', 'Alerte stock');
              this.produitService.refreshProduits();
              this.router.navigate(['/factures']);
              this.loading = false;
            }
          });
        } else {
          this.toastr.success(`Facture ${this.isEdit ? 'modifiée' : 'créée'} avec succès`, 'Succès');
          this.produitService.refreshProduits();
          this.router.navigate(['/factures']);
          this.loading = false;
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message || `Erreur lors de ${this.isEdit ? 'la modification' : 'la création'} de la facture`;
        this.toastr.error(errorMessage, 'Erreur');
        this.loading = false;
      }
    });
  }
}