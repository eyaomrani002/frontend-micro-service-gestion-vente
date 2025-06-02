// dashboard.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatsService {
  getVentesParMois(): Observable<{ labels: string[], data: number[] }> {
    return of({
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      data: [10000, 12000, 15000, 13000, 18000, 20000, 22000, 21000, 19000, 23000, 25000, 27000]
    });
  }

  getVentesParCategorie(): Observable<{ labels: string[], data: number[] }> {
    return of({
      labels: ['Électronique', 'Vêtements', 'Alimentation', 'Autres'],
      data: [45, 25, 20, 10]
    });
  }

  getClientsFideles(): Observable<any[]> {
    return of([
      { nom: 'Client A', achats: 25, ca: 100000, dette: 0 },
      { nom: 'Client B', achats: 20, ca: 80000, dette: 5000 },
      { nom: 'Client C', achats: 18, ca: 75000, dette: 0 }
    ]);
  }

  getProduitsTop(): Observable<any[]> {
    return of([
      { nom: 'Produit X', ventes: 120 },
      { nom: 'Produit Y', ventes: 110 },
      { nom: 'Produit Z', ventes: 90 }
    ]);
  }

  getProduitsRupture(): Observable<any[]> {
    return of([
      { nom: 'Produit X', stock: 0 },
      { nom: 'Produit Y', stock: 2 }
    ]);
  }

  getFacturesStats(): Observable<any> {
    return of({
      total: 500,
      payees: 400,
      enAttente: 100,
      reglees: [
        { id: 1, client: 'Client A', montant: 12000, statut: 'PAYEE' },
        { id: 2, client: 'Client B', montant: 8000, statut: 'PAYEE' }
      ],
      nonReglees: [
        { id: 3, client: 'Client C', montant: 5000, statut: 'NON_PAYEE' }
      ]
    });
  }

  getPaiementsStats(): Observable<any> {
    return of({
      recus: 950000,
      restant: 250000,
      historique: [
        { date: '2025-05-01', client: 'Client A', montant: 12000 },
        { date: '2025-05-03', client: 'Client B', montant: 8000 }
      ]
    });
  }

  getTauxReglement(): Observable<number> {
    return of(0.8); // 80%
  }
}
