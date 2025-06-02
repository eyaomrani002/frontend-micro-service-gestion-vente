import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Facture } from '../models/facture.model';
import { ProduitService } from '../../produits/services/produit.service';

@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private apiUrl = 'http://localhost:8888/facture-service/factures';

  constructor(private http: HttpClient, private produitService: ProduitService) {}

  getFactures(): Observable<Facture[]> {
    return this.http.get<Facture[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(factures => factures.map(f => ({
        ...f,
        dateFacture: f.dateFacture ? new Date(f.dateFacture) : undefined,
        status: f.status || 'NON_PAYEE'
      }))),
      catchError(error => {
        console.error('Erreur API /factures:', error);
        return throwError(() => new Error('Erreur lors du chargement des factures'));
      })
    );
  }

  getFacture(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.apiUrl}/full-facture/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(facture => ({
        ...facture,
        dateFacture: facture.dateFacture ? new Date(facture.dateFacture) : undefined
      })),
      catchError(error => {
        console.error(`Erreur API /full-facture/${id}:`, error);
        return throwError(() => new Error('Erreur lors du chargement de la facture'));
      })
    );
  }

  createFacture(facture: Facture): Observable<Facture> {
    const headers = { ...this.getAuthHeaders(), 'Content-Type': 'application/json' };
    return this.http.post<Facture>(this.apiUrl, facture, { headers }).pipe(
      tap(() => this.produitService.refreshProduits()), // Refresh products after facture creation
      catchError(error => {
        console.error('Erreur API /factures (POST):', error);
        let errorMessage = 'Erreur lors de la création de la facture';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateFacture(id: number, facture: Facture): Observable<Facture> {
    const headers = { ...this.getAuthHeaders(), 'Content-Type': 'application/json' };
    return this.http.put<Facture>(`${this.apiUrl}/${id}`, facture, { headers }).pipe(
      tap(() => this.produitService.refreshProduits()), // Refresh products after facture update
      catchError(error => {
        console.error(`Erreur API /factures/${id} (PUT):`, error);
        return throwError(() => new Error('Erreur lors de la mise à jour de la facture'));
      })
    );
  }

  deleteFacture(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error(`Erreur API /factures/${id} (DELETE):`, error);
        return throwError(() => new Error('Erreur lors de la suppression de la facture'));
      })
    );
  }

  getTotalSales(year?: number): Observable<number> {
    return this.http.get<{ totalYearly: { [key: number]: number }, totalGlobal: number }>(`${this.apiUrl}/sales/summary`, { headers: this.getAuthHeaders() }).pipe(
      map(summary => year ? summary.totalYearly[year] || 0 : summary.totalGlobal),
      catchError(error => {
        console.error('Erreur API /sales/summary:', error);
        return throwError(() => new Error('Erreur lors du chargement du total des ventes'));
      })
    );
  }

  getSalesByYear(): Observable<{ year: number, amount: number }[]> {
    return this.http.get<{ totalYearly: { [key: number]: number } }>(`${this.apiUrl}/sales/summary`, { headers: this.getAuthHeaders() }).pipe(
      map(summary => Object.entries(summary.totalYearly).map(([year, amount]) => ({
        year: +year,
        amount
      }))),
      catchError(error => {
        console.error('Erreur API /sales/summary:', error);
        return throwError(() => new Error('Erreur lors du chargement des ventes par année'));
      })
    );
  }

  getInvoiceStatusCount(): Observable<{ status: string, count: number }[]> {
    return this.http.get<{ totalGenerated: number, paidCount: number, pendingCount: number }>(`${this.apiUrl}/invoices/summary`, { headers: this.getAuthHeaders() }).pipe(
      map(summary => [
        { status: 'PAYEE', count: summary.paidCount },
        { status: 'NON_PAYEE', count: summary.pendingCount }
      ]),
      catchError(error => {
        console.error('Erreur API /invoices/summary:', error);
        return throwError(() => new Error('Erreur lors du chargement du statut des factures'));
      })
    );
  }

  getRevenueTrend(): Observable<{ year: number, month: string, total: number }[]> {
    return this.http.get<{ year: number, month: string, total: number }[]>(`${this.apiUrl}/sales/trends`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur API /sales/trends:', error);
        return throwError(() => new Error('Erreur lors du chargement des tendances de revenus'));
      })
    );
  }

  getPaymentRate(): Observable<{ paidPercentage: number, pendingPercentage: number }> {
    return this.http.get<{ paidPercentage: number, pendingPercentage: number }>(`${this.apiUrl}/invoices/payment-rate`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur API /invoices/payment-rate:', error);
        return throwError(() => new Error('Erreur lors du chargement du taux de paiement'));
      })
    );
  }

  getInvoicesByStatus(status: string): Observable<Facture[]> {
    return this.http.get<any>(`${this.apiUrl}/stats/${status.toLowerCase()}`, { headers: this.getAuthHeaders() }).pipe(
      map(factures => {
        if (!Array.isArray(factures)) {
          // Si la réponse n'est pas un tableau, retourne un tableau vide ou lève une erreur explicite
          console.error('La réponse attendue est un tableau, reçu :', factures);
          return [];
        }
        return factures.map(f => ({
          ...f,
          dateFacture: f.dateFacture ? new Date(f.dateFacture) : undefined
        }));
      }),
      catchError(error => {
        console.error(`Erreur API /stats/${status.toLowerCase()}:`, error);
        return throwError(() => new Error(`Erreur lors du chargement des factures ${status}`));
      })
    );
  }

  getPaymentsVsRemaining(): Observable<{ payments: number, remaining: number }> {
    return this.getFactures().pipe(
      map(factures => ({
        payments: factures.reduce((sum, f) => sum + (f.montantPaye || 0), 0),
        remaining: factures.reduce((sum, f) => sum + (f.resteAPayer || 0), 0)
      })),
      catchError(error => {
        console.error('Erreur calcul paiements vs restant:', error);
        return throwError(() => new Error('Erreur lors du calcul des paiements vs restant'));
      })
    );
  }

  /**
   * Retourne le(s) produit(s) le(s) plus vendu(s) (top N)
   * @param limit nombre de produits à retourner (par défaut 1)
   */
  getTopSoldProducts(limit: number = 1): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/stats/produit-top?limit=${limit}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(res => Array.isArray(res) ? res : (res.topProduits || [])),
        catchError(error => {
          console.error('Erreur API /stats/produit-top:', error);
          return throwError(() => new Error('Erreur lors du chargement du produit le plus vendu'));
        })
      );
  }

  /**
   * Retourne le(s) client(s) le(s) plus fidèle(s) (top N par nombre d'achats)
   * @param limit nombre de clients à retourner (par défaut 5)
   */
  getTopClientsByPurchases(limit: number = 5): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/stats/clients-fideles?limit=${limit}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(res => Array.isArray(res) ? res : (res.topClients || [])),
        catchError(error => {
          console.error('Erreur API /stats/clients-fideles:', error);
          return throwError(() => new Error('Erreur lors du chargement des clients fidèles'));
        })
      );
  }

  // Ajoute la méthode getAuthHeaders pour inclure le token JWT
  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  
}