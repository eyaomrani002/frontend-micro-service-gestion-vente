import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Produit } from '../../../produits/models/produit.model';
import { Reglement } from '../../../reglements/models/reglement.model';
import { Facture } from '../../../factures/models/facture.model';
import { FactureService } from '../../../factures/services/facture.service';
import { ClientService } from '../../../clients/services/client.service';
import { ProduitService } from '../../../produits/services/produit.service';
import { ReglementService } from '../../../reglements/services/reglement.service';
import { NgChartsModule } from 'ng2-charts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from '../../../login/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgChartsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedYear: string = '';
  years: string[] = ['', '2023', '2024', '2025'];
  totalSales: number = 0;
  activeClients: number = 0;
  newClients: number = 0;
  outOfStockCount: number = 0;
  paymentRate: { paidPercentage: number, pendingPercentage: number } = { paidPercentage: 0, pendingPercentage: 0 };
  growthRate: number | null = null;
  growthPeriod: 'mois' | 'an' | null = null;
  role: string | null = null;

  // Table data sources
  topClientsDataSource = new MatTableDataSource<{ clientId: number, clientNom: string, chiffreAffaires: number }>();
  topClientsColumns: string[] = ['clientNom', 'chiffreAffaires'];
  clientsWithDebtsDataSource = new MatTableDataSource<{ clientId: number, clientNom: string, debt: number }>();
  clientsWithDebtsColumns: string[] = ['clientNom', 'debt'];
  // Correction ici : accepte un tableau d'objets custom pour le top produits
  topProductsDataSource = new MatTableDataSource<{ name: string, quantitySold: number }>();
  topProductsColumns: string[] = ['name', 'quantitySold'];
  outOfStockDataSource = new MatTableDataSource<Produit>();
  outOfStockColumns: string[] = ['name', 'price'];
  settledInvoicesDataSource = new MatTableDataSource<Facture>();
  pendingInvoicesDataSource = new MatTableDataSource<Facture>();
  invoicesColumns: string[] = ['id', 'clientName', 'total', 'status', 'dateFacture'];
  recentPaymentsDataSource = new MatTableDataSource<Reglement>();
  recentPaymentsColumns: string[] = ['id', 'factureId', 'clientName', 'montant', 'status', 'dateReglement'];

  // Chart configs
  salesByYearChart: any;
  invoiceStatusChart: any;
  revenueByClientChart: any;
  salesByCategoryChart: any;
  paymentsVsRemainingChart: any;
  revenueTrendChart: any;

  loading: boolean = true;
  topSoldProducts: any[] = [];

  // Historique des actions récentes (ventes, clients, règlements)
  recentActions: { type: string, label: string, date: Date, details: string }[] = [];

  constructor(
    private factureService: FactureService,
    private clientService: ClientService,
    private produitService: ProduitService,
    private reglementService: ReglementService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.updateDashboard();
  }

  updateDashboard(): void {
    this.loading = true;
    const year = this.selectedYear ? +this.selectedYear : undefined;

    // Vue d'ensemble
    this.factureService.getTotalSales(year).subscribe({
      next: total => this.totalSales = total,
      error: () => this.toastr.error('Error loading total sales')
    });

    // Clients actifs (OK)
    this.clientService.getActiveClients().subscribe({
      next: clients => this.activeClients = clients.length,
      error: () => this.toastr.error('Error loading active clients')
    });

    // Nouveaux clients (OK)
    this.clientService.getNewClients(year).subscribe({
      next: clients => this.newClients = clients.length,
      error: () => this.toastr.error('Error loading new clients')
    });

    // Ruptures de stock (OK)
    this.produitService.getOutOfStockProducts().subscribe({
      next: products => {
        this.outOfStockCount = products.length;
        this.outOfStockDataSource.data = products;
      },
      error: () => this.toastr.error('Error loading out-of-stock products')
    });

    // Statut des factures
    this.factureService.getInvoiceStatusCount().subscribe({
      next: data => {
        this.invoiceStatusChart = {
          type: 'pie',
          data: {
            labels: data.map(item => item.status),
            datasets: [{
              data: data.map(item => item.count),
              backgroundColor: ['#9ab3f5', '#b5ead7', '#ffb7b2'],
              borderColor: '#ffffff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  font: { family: 'Roboto', size: 14 }
                }
              }
            }
          }
        };
      },
      error: () => this.toastr.error('Error loading invoice status')
    });

    // Ventes par année
    this.factureService.getSalesByYear().subscribe({
      next: data => {
        this.salesByYearChart = {
          type: 'bar',
          data: {
            labels: data.map(item => item.year),
            datasets: [{
              label: 'Sales (TND)',
              data: data.map(item => item.amount),
              backgroundColor: '#a3d8f4',
              borderColor: '#a3d8f4',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
              x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
          }
        };
      },
      error: () => this.toastr.error('Error loading sales by year')
    });

    // Top clients (fidèles) via facture-service
    this.factureService.getTopClientsByPurchases(5).subscribe({
      next: clients => {
        this.topClientsDataSource.data = clients;
        this.revenueByClientChart = {
          type: 'bar',
          data: {
            labels: clients.map(c => c.clientNom),
            datasets: [{
              label: 'Revenue (TND)',
              data: clients.map(c => c.chiffreAffaires),
              backgroundColor: ['#9ab3f5', '#a3d8f4', '#b5ead7', '#ffb7b2', '#ffdac1'],
              borderColor: '#ffffff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
              x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
          }
        };
      },
      error: () => this.toastr.error('Error loading top clients')
    });

    // Clients débiteurs (OK, mais peut être optimisé côté backend)
    this.clientService.getClientsWithDebts().subscribe({
      next: debts => this.clientsWithDebtsDataSource.data = debts,
      error: () => this.toastr.error('Error loading clients with debts')
    });

    // Top produits (le plus vendu) via facture-service
    this.factureService.getTopSoldProducts(5).subscribe({
      next: produits => {
        // Mapping pour la table : on adapte le format attendu
        this.topProductsDataSource.data = produits.map(p => ({
          name: p.produitNom || p.name || 'N/A',
          quantitySold: p.quantiteVendue || p.ventes || 0
        }));
      },
      error: () => this.toastr.error('Error loading top products')
    });

    // Ventes par catégorie (OK)
    this.produitService.getSalesByCategory().subscribe({
      next: data => {
        this.salesByCategoryChart = {
          type: 'doughnut',
          data: {
            labels: data.map(item => item.category),
            datasets: [{
              data: data.map(item => item.sales),
              backgroundColor: ['#9ab3f5', '#a3d8f4', '#b5ead7', '#ffb7b2', '#ffdac1'],
              borderColor: '#ffffff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: { font: { family: 'Roboto', size: 14 } }
              }
            }
          }
        };
      },
      error: () => this.toastr.error('Error loading sales by category')
    });

    // Factures réglées
    this.factureService.getInvoicesByStatus('reglees').subscribe({
      next: invoices => this.settledInvoicesDataSource.data = invoices,
      error: () => this.toastr.error('Error loading settled invoices')
    });

    // Factures en attente
    this.factureService.getInvoicesByStatus('non-reglees').subscribe({
      next: invoices => this.pendingInvoicesDataSource.data = invoices,
      error: () => this.toastr.error('Error loading pending invoices')
    });

    // Paiements vs restant (OK)
    this.factureService.getPaymentsVsRemaining().subscribe({
      next: data => {
        this.paymentsVsRemainingChart = {
          type: 'bar',
          data: {
            labels: ['Payments Received', 'Remaining'],
            datasets: [{
              label: 'Amount (TND)',
              data: [data.payments, data.remaining],
              backgroundColor: ['#a3d8f4', '#ffb7b2'],
              borderColor: '#ffffff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
              x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
          }
        };
      },
      error: () => this.toastr.error('Error loading payments vs remaining')
    });

    // Récents paiements (OK)
    this.reglementService.getRecentPayments().subscribe({
      next: payments => this.recentPaymentsDataSource.data = payments,
      error: () => this.toastr.error('Error loading recent payments')
    });

    // Statistiques
    this.factureService.getRevenueTrend().subscribe({
      next: data => {
        const labels = data.map(item => `${item.month}/${item.year}`);
        this.revenueTrendChart = {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Revenue (TND)',
              data: data.map(item => item.total),
              backgroundColor: '#9ab3f5',
              borderColor: '#9ab3f5',
              fill: false,
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
              x: { grid: { color: 'rgba(0, 0, 0, 0.05)' } }
            },
            plugins: { legend: { display: false } }
          }
        };
        // Calcul du taux de croissance mensuel (si au moins 2 mois)
        if (data.length >= 2) {
          const last = data[data.length - 1].total;
          const prev = data[data.length - 2].total;
          this.growthRate = prev === 0 ? null : ((last - prev) / prev) * 100;
          this.growthPeriod = 'mois';
        } else {
          this.growthRate = null;
          this.growthPeriod = null;
        }
      },
      error: () => {
        this.toastr.error('Error loading revenue trend');
        this.growthRate = null;
        this.growthPeriod = null;
      }
    });

    // Taux de paiement
    this.factureService.getPaymentRate().subscribe({
      next: rate => this.paymentRate = rate,
      error: () => this.toastr.error('Error loading payment rate')
    });

    // Produit le plus vendu (pour la carte)
    this.factureService.getTopSoldProducts(1).subscribe({
      next: produits => this.topSoldProducts = produits,
      error: () => this.toastr.error('Erreur lors du chargement du produit le plus vendu')
    });

    // Historique des actions récentes (ventes, clients, règlements)
    Promise.all([
      this.factureService.getFactures().toPromise(),
      this.clientService.getNewClients().toPromise(),
      this.reglementService.getRecentPayments().toPromise()
    ]).then(([factures, newClients, reglements]) => {
      const actions: { type: string, label: string, date: Date, details: string }[] = [];
      // Nouvelles ventes (factures récentes)
      if (factures) {
        factures.sort((a, b) => 
          new Date(b.dateFacture ?? 0).getTime() - new Date(a.dateFacture ?? 0).getTime()
        );
        factures.slice(0, 5).forEach(f => actions.push({
          type: 'vente',
          label: `Nouvelle vente #${f.id}`,
          date: new Date(f.dateFacture ?? ''),
          details: `Client: ${f.client?.name || 'N/A'}, Montant: ${f.total} TND`
        }));
      }
      // Nouveaux clients
      if (newClients) {
        // Correction : on vérifie la présence d'une date dans l'objet client (aucune propriété date connue, donc on ignore le tri par date)
        newClients.slice(0, 5).forEach(c => {
          actions.push({
            type: 'client',
            label: `Nouveau client: ${c.name}`,
            date: new Date(), // Pas de date réelle disponible
            details: `Email: ${c.email || 'N/A'}`
          });
        });
      }
      // Règlements récents
      if (reglements) {
        reglements.sort((a, b) => new Date(b.dateReglement).getTime() - new Date(a.dateReglement).getTime());
        reglements.slice(0, 5).forEach(r => actions.push({
          type: 'reglement',
          label: `Règlement #${r.id}`,
          date: new Date(r.dateReglement),
          details: `Facture: #${r.factureId}, Montant: ${r.montant} TND`
        }));
      }
      // Tri global par date décroissante
      this.recentActions = actions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
    }).catch(() => this.toastr.error('Error loading recent actions'));

    this.loading = false;
  }

  exportStatsToExcel(): void {
    // Exemple : exporte le top clients et top produits
    const wsClients = XLSX.utils.json_to_sheet(this.topClientsDataSource.data);
    const wsProducts = XLSX.utils.json_to_sheet(this.topProductsDataSource.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsClients, 'Top Clients');
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Top Produits');
    XLSX.writeFile(wb, 'dashboard-statistiques.xlsx');
  }

  exportStatsToPDF(): void {
    const doc = new jsPDF();
    doc.text('Statistiques Dashboard', 14, 16);

    // Top clients
    doc.text('Top 5 Clients', 14, 28);
    autoTable(doc, {
      startY: 32,
      head: [['Client', "Chiffre d'affaires"]],
      body: this.topClientsDataSource.data.map(c => [c.clientNom, c.chiffreAffaires]),
      theme: 'striped',
      headStyles: { fillColor: [154, 179, 245] }
    });
    let y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 60;

    // Top produits
    doc.text('Top 5 Produits', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['Produit', 'Quantité vendue']],
      body: this.topProductsDataSource.data.map(p => [p.name, p.quantitySold]),
      theme: 'striped',
      headStyles: { fillColor: [181, 234, 215] }
    });
    y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : y + 40;

    // Clients débiteurs
    doc.text('Clients débiteurs', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['Client', 'Dette (TND)']],
      body: this.clientsWithDebtsDataSource.data.map(c => [c.clientNom, c.debt]),
      theme: 'striped',
      headStyles: { fillColor: [255, 183, 178] }
    });
    y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : y + 40;

    // Produits en rupture de stock
    doc.text('Produits en rupture de stock', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['Produit', 'Prix']],
      body: this.outOfStockDataSource.data.map(p => [p.name, p.price]),
      theme: 'striped',
      headStyles: { fillColor: [255, 218, 193] }
    });
    y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : y + 40;

    // Factures réglées
    doc.text('Factures réglées', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['ID', 'Client', 'Total', 'Statut', 'Date']],
      body: this.settledInvoicesDataSource.data.map(f => [
        f.id ?? '',
        f.client?.name ?? '',
        f.total ?? '',
        f.status ?? '',
        f.dateFacture ? (typeof f.dateFacture === 'string' ? f.dateFacture : new Date(f.dateFacture).toLocaleDateString()) : ''
      ]),
      theme: 'striped',
      headStyles: { fillColor: [154, 179, 245] }
    });
    y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : y + 40;

    // Factures en attente
    doc.text('Factures en attente', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['ID', 'Client', 'Total', 'Statut', 'Date']],
      body: this.pendingInvoicesDataSource.data.map(f => [
        f.id ?? '',
        f.client?.name ?? '',
        f.total ?? '',
        f.status ?? '',
        f.dateFacture ? (typeof f.dateFacture === 'string' ? f.dateFacture : new Date(f.dateFacture).toLocaleDateString()) : ''
      ]),
      theme: 'striped',
      headStyles: { fillColor: [255, 183, 178] }
    });
    y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : y + 40;

    // Paiements récents
    doc.text('Paiements récents', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['ID', 'Facture', 'Client', 'Montant', 'Statut', 'Date']],
      body: this.recentPaymentsDataSource.data.map(r => [
        r.id ?? '',
        r.factureId ?? '',
        (r as any).facture && (r as any).facture.client && (r as any).facture.client.name ? (r as any).facture.client.name : '',
        r.montant ?? '',
        r.statut ?? '',
        r.dateReglement ? (typeof r.dateReglement === 'string' ? r.dateReglement : new Date(r.dateReglement).toLocaleDateString()) : ''
      ]),
      theme: 'striped',
      headStyles: { fillColor: [181, 234, 215] }
    });
    y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : y + 40;

    // Indicateurs globaux
    doc.text('Indicateurs globaux', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['Total ventes', 'Clients actifs', 'Nouveaux clients', 'Produits en rupture', 'Taux de paiement', 'Taux de croissance']],
      body: [[
        this.totalSales,
        this.activeClients,
        this.newClients,
        this.outOfStockCount,
        `${this.paymentRate.paidPercentage}%`,
        this.growthRate !== null ? `${this.growthRate.toFixed(2)}% (${this.growthPeriod})` : 'N/A'
      ]],
      theme: 'grid',
      headStyles: { fillColor: [154, 179, 245] }
    });

    doc.save('dashboard-statistiques.pdf');
  }
}