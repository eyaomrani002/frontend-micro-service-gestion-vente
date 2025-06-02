import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FactureService } from '../../services/facture.service';
import { Facture } from '../../models/facture.model';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-factures-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './factures-list.component.html',
  styleUrls: ['./factures-list.component.css']
})
export class FacturesListComponent implements OnInit {
  dataSource = new MatTableDataSource<Facture>([]);
  displayedColumns: string[] = ['id', 'clientID', 'dateFacture', 'status', 'total', 'montantPaye', 'resteAPayer', 'actions'];
  loading = false;
  errorMessage = '';
  hasData = false;

  constructor(
    private factureService: FactureService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.loading = true;
    this.errorMessage = '';
    this.factureService.getFactures().subscribe({
      next: (factures) => {
        console.log('Factures reçues:', factures);
        this.dataSource.data = factures;
        this.hasData = factures.length > 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement:', err);
        this.errorMessage = 'Impossible de charger les factures. Vérifiez la connexion au serveur.';
        this.toastr.error(this.errorMessage, 'Erreur');
        this.hasData = false;
        this.loading = false;
      }
    });
  }

  deleteFacture(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette facture ?')) {
      this.factureService.deleteFacture(id).subscribe({
        next: () => {
          this.loadFactures();
          this.toastr.success('Facture supprimée avec succès', 'Succès');
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.toastr.error('Erreur lors de la suppression de la facture', 'Erreur');
        }
      });
    }
  }

  printFacture(id: number): void {
    this.factureService.getFacture(id).subscribe({
      next: (facture) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Facture #${facture.id}</title>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f9fafb;
                  color: #1f2937;
                }
                .invoice-container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: white;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
                }
                .invoice-header {
                  background: #1f2937;
                  color: white;
                  padding: 20px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }
                .invoice-header h1 {
                  margin: 0;
                  font-size: 24px;
                }
                .invoice-header .logo {
                  font-size: 18px;
                  font-weight: bold;
                }
                .invoice-details {
                  padding: 20px;
                  border-bottom: 1px solid #e5e7eb;
                }
                .invoice-details p {
                  margin: 8px 0;
                  font-size: 16px;
                }
                .invoice-details .status {
                  padding: 4px 12px;
                  border-radius: 9999px;
                  font-size: 14px;
                  font-weight: 500;
                }
                .status-payee { background: #10b981; color: white; }
                .status-partielle { background: #f59e0b; color: white; }
                .status-non-payee { background: #ef4444; color: white; }
                .invoice-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                }
                .invoice-table th, .invoice-table td {
                  padding: 12px;
                  text-align: left;
                  border-bottom: 1px solid #e5e7eb;
                }
                .invoice-table th {
                  background: #f3f4f6;
                  font-weight: 600;
                }
                .invoice-table td {
                  font-size: 14px;
                }
                .invoice-footer {
                  display: flex;
                  justify-content: flex-end;
                  gap: 40px;
                  background: #f3f4f6;
                  border-top: 1px solid #e5e7eb;
                  padding: 20px;
                }
                .invoice-footer div {
                  text-align: right;
                }
                .invoice-footer .total {
                  font-size: 18px;
                  font-weight: bold;
                  color: #1f2937;
                }
                .invoice-footer .montant-paye {
                  font-size: 16px;
                  font-weight: 500;
                  color: #2563eb;
                }
                .invoice-footer .reste-a-payer {
                  font-size: 16px;
                  font-weight: 500;
                  color: #ef4444;
                }
                .print-button {
                  display: block;
                  margin: 20px auto;
                  padding: 10px 20px;
                  background: #1f2937;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 16px;
                }
                @media print {
                  body { background: white; padding: 0; }
                  .invoice-container { box-shadow: none; }
                  .print-button { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="invoice-container">
                <div class="invoice-header">
                  <h1>Facture #${facture.id}</h1>
                  <div class="logo">gestion de vente</div>
                </div>
                <div class="invoice-details">
                  <p><strong>Client ID:</strong> ${facture.clientID}</p>
                  <p><strong>Date:</strong> ${
                    facture.dateFacture
                      ? new Date(facture.dateFacture).toLocaleDateString('fr-FR')
                      : 'Non définie'
                  }</p>
                  <p><strong>Statut:</strong> <span class="status status-${
                    facture.status === 'PAYEE' ? 'payee' :
                    facture.status === 'PARTIELLEMENT_PAYEE' ? 'partielle' :
                    'non-payee'
                  }">${facture.status}</span></p>
                </div>
                <table class="invoice-table">
                  <thead>
                    <tr>
                      <th>Produit ID</th>
                      <th>Quantité</th>
                      <th>Prix Unitaire (TND)</th>
                      <th>Total (TND)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      facture.factureLignes?.map(ligne => `
                        <tr>
                          <td>${ligne.produitID}</td>
                          <td>${ligne.quantity}</td>
                          <td>${ligne.price.toFixed(2)}</td>
                          <td>${(ligne.price * ligne.quantity).toFixed(2)}</td>
                        </tr>
                      `).join('') || '<tr><td colspan="4">Aucune ligne</td></tr>'
                    }
                  </tbody>
                </table>
                <div class="invoice-footer" style="display: flex; justify-content: flex-end; gap: 40px; background: #f3f4f6; border-top: 1px solid #e5e7eb;">
                  <div style="text-align: right;">
                    <div style="font-size: 18px; font-weight: bold; color: #1f2937;">Total</div>
                    <div style="font-size: 18px; color: #10b981;">${facture.total ? facture.total.toFixed(2) : '0.00'} TND</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 16px; font-weight: 500; color: #1f2937;">Montant Payé</div>
                    <div style="font-size: 16px; color: #2563eb;">${facture.montantPaye ? facture.montantPaye.toFixed(2) : '0.00'} TND</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 16px; font-weight: 500; color: #1f2937;">Reste à Payer</div>
                    <div style="font-size: 16px; color: #ef4444;">${facture.resteAPayer ? facture.resteAPayer.toFixed(2) : '0.00'} TND</div>
                  </div>
                </div>
              </div>
              <button class="print-button" onclick="window.print()">Imprimer</button>
            </body>
            </html>
          `);
          printWindow.document.close();
        } else {
          this.toastr.error('Impossible d\'ouvrir la fenêtre d\'impression', 'Erreur');
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la facture:', err);
        this.toastr.error('Erreur lors du chargement de la facture pour impression', 'Erreur');
      }
    });
  }

  downloadFactureAsPDF(id: number): void {
    this.factureService.getFacture(id).subscribe({
      next: (facture) => {
        const doc = new jsPDF();
        let yOffset = 20;

        // Header
        doc.setFillColor(31, 41, 55); // Dark gray (#1f2937)
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text(`Facture #${facture.id}`, 20, 15);
        doc.setFontSize(12);
        doc.text('gestion de vente', 150, 15);
        yOffset += 20;

        // Details
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(12);
        doc.text(`Client ID: ${facture.clientID}`, 20, yOffset);
        yOffset += 10;
        doc.text(
          `Date: ${
            facture.dateFacture
              ? new Date(facture.dateFacture).toLocaleDateString('fr-FR')
              : 'Non définie'
          }`,
          20,
          yOffset
        );
        yOffset += 10;
        doc.text(`Statut: ${facture.status}`, 20, yOffset);
        if (facture.status === 'PAYEE') {
          doc.setFillColor(16, 185, 129); // Green
        } else if (facture.status === 'PARTIELLEMENT_PAYEE') {
          doc.setFillColor(245, 158, 11); // Yellow
        } else {
          doc.setFillColor(239, 68, 68); // Red
        }
        doc.roundedRect(70, yOffset - 6, 40, 8, 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(facture.status, 75, yOffset);
        doc.setTextColor(31, 41, 55);
        yOffset += 20;

        // Table Header
        doc.setFillColor(243, 244, 246); // Light gray (#f3f4f6)
        doc.rect(20, yOffset, 170, 10, 'F');
        doc.setFontSize(10);
        doc.text('Produit ID', 25, yOffset + 7);
        doc.text('Quantité', 60, yOffset + 7);
        doc.text('Prix Unitaire (TND)', 90, yOffset + 7);
        doc.text('Total (TND)', 150, yOffset + 7);
        yOffset += 10;

        // Table Rows
        facture.factureLignes?.forEach((ligne) => {
          doc.setFontSize(10);
          doc.text(`${ligne.produitID}`, 25, yOffset + 7);
          doc.text(`${ligne.quantity}`, 60, yOffset + 7);
          doc.text(`${ligne.price.toFixed(2)}`, 90, yOffset + 7);
          doc.text(`${(ligne.price * ligne.quantity).toFixed(2)}`, 150, yOffset + 7);
          doc.line(20, yOffset + 10, 190, yOffset + 10); // Bottom border
          yOffset += 10;
        });

        if (!facture.factureLignes || facture.factureLignes.length === 0) {
          doc.text('Aucune ligne', 25, yOffset + 7);
          yOffset += 10;
        }

        // Footer
        yOffset += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: ${facture.total?.toFixed(2) || '0.00'} TND`, 150, yOffset);
        yOffset += 10;
        doc.text(`Montant Payé: ${facture.montantPaye?.toFixed(2) || '0.00'} TND`, 150, yOffset);
        yOffset += 10;
        doc.text(`Reste à Payer: ${facture.resteAPayer?.toFixed(2) || '0.00'} TND`, 150, yOffset);
        doc.setFont('helvetica', 'normal');

        // Save PDF
        doc.save(`Facture_${facture.id}.pdf`);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la facture:', err);
        this.toastr.error('Erreur lors du chargement de la facture pour téléchargement', 'Erreur');
      }
    });
  }
}