import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Categorie } from '../models/categorie.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private apiUrl = 'http://localhost:8888/produit-service/produits/categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Categorie[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(response => {
        if (response._embedded && response._embedded.categories) return response._embedded.categories;
        if (Array.isArray(response)) return response;
        if (response.content) return response.content;
        return [];
      }),
      catchError(error => {
        console.error('Erreur API /categories:', error);
        if (error && error.message) {
          console.error('Problème lors du chargement des catégories :', error.message);
        } else {
          console.error('Problème inconnu lors du chargement des catégories');
        }
        return throwError(() => new Error('Erreur lors du chargement des catégories'));
      })
    );
  }

  getCategorie(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur API /categories/id:', error);
        if (error && error.message) {
          console.error('Problème lors du chargement de la catégorie :', error.message);
        } else {
          console.error('Problème inconnu lors du chargement de la catégorie');
        }
        return throwError(() => new Error('Erreur lors du chargement de la catégorie'));
      })
    );
  }

  createCategorie(categorie: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, categorie, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur création catégorie:', error);
        if (error && error.message) {
          console.error('Problème lors de la création de la catégorie :', error.message);
        } else {
          console.error('Problème inconnu lors de la création de la catégorie');
        }
        return throwError(() => new Error('Erreur lors de la création de la catégorie'));
      })
    );
  }

  updateCategorie(id: number, categorie: Categorie): Observable<Categorie> {
    const headers = { ...this.getAuthHeaders(), 'Content-Type': 'application/json' };

    // Optionnel : log pour debug
    console.log('Update catégorie:', id, categorie);

    return this.http.put<Categorie>(`${this.apiUrl}/${id}`, categorie, { headers }).pipe(
      catchError(error => {
        console.error('Erreur mise à jour catégorie:', error);
        if (error && error.message) {
          console.error('Problème lors de la mise à jour de la catégorie :', error.message);
        } else {
          console.error('Problème inconnu lors de la mise à jour de la catégorie');
        }
        return throwError(() => new Error('Erreur lors de la mise à jour de la catégorie'));
      })
    );
  }

  deleteCategorie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur suppression catégorie:', error);
        return throwError(() => new Error('Erreur lors de la suppression de la catégorie'));
      })
    );
  }

  // Ajoute la méthode getAuthHeaders pour inclure le token JWT
  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}
