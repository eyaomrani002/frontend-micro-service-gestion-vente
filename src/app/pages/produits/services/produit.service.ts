import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, BehaviorSubject } from 'rxjs';
import { Produit } from '../models/produit.model';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = 'http://localhost:8888/produit-service/produits';
  private produitsSubject = new BehaviorSubject<Produit[]>([]);
  produits$ = this.produitsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProduits(); // Initial load
  }

  private loadProduits(): void {
    this.getProduits().subscribe({
      next: (produits) => this.produitsSubject.next(produits),
      error: (err) => console.error('Erreur initiale chargement produits:', err)
    });
  }

  refreshProduits(): void {
    this.loadProduits(); // Reload products to update stock
  }

  getProduits(): Observable<Produit[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(response => {
        let produits: Produit[] = [];
        if (Array.isArray(response)) {
          produits = response;
        } else if (response.content) {
          produits = response.content;
        } else if (response._embedded && response._embedded.produits) {
          produits = response._embedded.produits;
        }
        // Ensure each product has a category with at least a name
        produits = produits.map(p => ({
          ...p,
          categorie: p.categorie ? { 
            id: p.categorie.id, 
            name: p.categorie.name || 'Non assignée',
            description: p.categorie.description 
          } : { name: 'Non assignée' }
        }));
        return produits;
      }),
      catchError(error => {
        console.error('Erreur API /produits:', error);
        return throwError(() => new Error('Erreur lors du chargement des produits'));
      })
    );
  }

  getProduit(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error(`Erreur API /produits/${id}:`, error);
        return throwError(() => new Error('Erreur lors du chargement du produit'));
      })
    );
  }

  createProduit(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur API /produits (POST):', error);
        return throwError(() => new Error('Erreur lors de la création du produit'));
      })
    );
  }

  updateProduit(id: number, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, produit, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error(`Erreur API /produits/${id} (PUT):`, error);
        return throwError(() => new Error('Erreur lors de la mise à jour du produit'));
      })
    );
  }

  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error(`Erreur API /produits/${id} (DELETE):`, error);
        return throwError(() => new Error('Erreur lors de la suppression du produit'));
      })
    );
  }

  getProduitsEnRupture(): Observable<Produit[]> {
    return this.http.get<{ content: Produit[] }>(`${this.apiUrl}/rupture`, { headers: this.getAuthHeaders() }).pipe(
      map(response => response.content || []),
      catchError(error => {
        console.error('Erreur API /produits/rupture:', error);
        return throwError(() => new Error('Erreur lors du chargement des produits en rupture'));
      })
    );
  }

  getTopVendus(limit: number = 10): Observable<Produit[]> {
    const params = { limit: limit.toString() };
    return this.http.get<{ content: Produit[] }>(`${this.apiUrl}/top-vendus`, { params, headers: this.getAuthHeaders() }).pipe(
      map(response => response.content || []),
      catchError(error => {
        console.error('Erreur API /produits/top-vendus:', error);
        return throwError(() => new Error('Erreur lors du chargement des produits top vendus'));
      })
    );
  }

  getTopSellingProducts(limit: number = 5, year?: number): Observable<Produit[]> {
    let params: any = { limit: limit.toString() };
    if (year) params.annee = year.toString();
    return this.http.get<{ _embedded: { produits: Produit[] } }>(`${this.apiUrl}/top-vendus`, { params, headers: this.getAuthHeaders() }).pipe(
      map(response => response._embedded.produits),
      catchError(error => {
        console.error('Erreur API /top-vendus:', error);
        return throwError(() => new Error('Erreur lors du chargement des produits les plus vendus'));
      })
    );
  }

  getOutOfStockProducts(): Observable<Produit[]> {
    return this.http.get<any>(`${this.apiUrl}/rupture`, { headers: this.getAuthHeaders() }).pipe(
      map(response => {
        // Supporte _embedded.produits, content, ou tableau direct
        if (response && response._embedded && Array.isArray(response._embedded.produits)) {
          return response._embedded.produits;
        } else if (response && Array.isArray(response.content)) {
          return response.content;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          return [];
        }
      }),
      catchError(error => {
        console.error('Erreur API /rupture:', error);
        return throwError(() => new Error('Erreur lors du chargement des produits en rupture'));
      })
    );
  }

  getSalesByCategory(): Observable<{ category: string, sales: number }[]> {
    return this.getProduits().pipe(
      map(produits => {
        const categoryMap = produits.reduce((acc, produit) => {
          const category = produit.categorie?.name || 'Unknown';
          acc[category] = (acc[category] || 0) + (produit.price * produit.quantity);
          return acc;
        }, {} as { [key: string]: number });
        return Object.entries(categoryMap).map(([category, sales]) => ({ category, sales }));
      }),
      catchError(error => {
        console.error('Erreur API sales by category:', error);
        return throwError(() => new Error('Erreur lors du chargement des ventes par catégorie'));
      })
    );
  }

  /**
   * Diminue le stock d'un produit donné
   * @param id identifiant du produit
   * @param quantite quantité à diminuer
   */
  decreaseStock(id: number, quantite: number): Observable<Produit> {
    // Correction : passage de la quantité dans l'URL (le backend attend probablement /decreaseStock/{quantite})
    return this.http.put<Produit>(`${this.apiUrl}/${id}/decreaseStock/${quantite}`, {}, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error(`Erreur diminution stock produit ${id}:`, error);
        return throwError(() => new Error('Erreur lors de la diminution du stock'));
      })
    );
  }

  // Ajoute la méthode getAuthHeaders pour inclure le token JWT
  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}