// src/app/reglements/services/reglement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Reglement, Facture, Devise } from '../models/reglement.model';

@Injectable({
  providedIn: 'root'
})
export class ReglementService {
  private apiUrl = 'http://localhost:8888/reglement-service/reglements'; // adapte selon ton gateway ou port
  private factureApiUrl = `http://localhost:8888/facture-service/factures`;
  private deviseApiUrl = `http://localhost:8888/devise-service/devises`;

  constructor(private http: HttpClient) {}

  getReglements(page: number = 0, size: number = 5): Observable<{ reglements: Reglement[], totalPages: number, totalElements: number }> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params, headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getReglement(id: number): Observable<Reglement> {
    return this.http.get<Reglement>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createReglement(reglement: Reglement): Observable<Reglement> {
    return this.http.post<Reglement>(this.apiUrl, reglement, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateReglement(id: number, reglement: Reglement): Observable<Reglement> {
    return this.http.put<Reglement>(`${this.apiUrl}/${id}`, reglement, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteReglement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getReglementsByFacture(factureId: number): Observable<Reglement[]> {
    return this.http.get<Reglement[]>(`${this.apiUrl}/facture/${factureId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getReglementsByClient(clientId: number, page: number = 0, size: number = 5): Observable<{ reglements: Reglement[], totalPages: number, totalElements: number }> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/client/${clientId}`, { params, headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getFactureById(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.factureApiUrl}/full-facture/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getFactureIdsByClient(clientId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.factureApiUrl}/client/${clientId}/ids`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getDevises(): Observable<string[]> {
    return this.http.get<Devise[]>(this.deviseApiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(devises => devises.map(d => d.code)),
      catchError(this.handleError)
    );
  }

  getRecentPayments(limit: number = 5): Observable<Reglement[]> {
    return this.http.get<{ reglements: Reglement[] }>(this.apiUrl, {
      params: { size: limit.toString() },
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.reglements.map(r => ({
        ...r,
        dateReglement: r.dateReglement ? new Date(r.dateReglement) : r.dateReglement
      }))),
      catchError(error => {
        console.error('Erreur API /reglements:', error);
        return throwError(() => new Error('Erreur lors du chargement des règlements'));
      })
    );
  }

  /**
   * Récupère toutes les factures d'un client (utile pour affichage dans le formulaire de règlement)
   */
  getFacturesByClient(clientId: number): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.factureApiUrl}/client/${clientId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère toutes les factures (pour affichage dans le formulaire de règlement)
   */
  getAllFactures(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.factureApiUrl}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    const errorMessage = error.error?.message || 'An error occurred. Please try again.';
    return throwError(() => new Error(errorMessage));
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}