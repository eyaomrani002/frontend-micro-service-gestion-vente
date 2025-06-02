import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Devise } from '../models/devise.model';

@Injectable({
  providedIn: 'root'
})
export class DeviseService {
  private apiUrl = 'http://localhost:8888/devise-service/devises'; // adapte l’URL selon ton backend

  constructor(private http: HttpClient) {}

  getAllDevises(): Observable<Devise[]> {
    return this.http.get<Devise[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getDeviseById(id: number): Observable<Devise> {
    return this.http.get<Devise>(`${this.apiUrl}/id/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getDeviseByCode(code: string): Observable<Devise> {
    return this.http.get<Devise>(`${this.apiUrl}/${code}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createDevise(devise: Devise): Observable<Devise> {
    return this.http.post<Devise>(this.apiUrl, devise, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateDevise(id: number, devise: Devise): Observable<Devise> {
    return this.http.put<Devise>(`${this.apiUrl}/${id}`, devise, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteDevise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/id/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  convert(montant: number, from: string, to: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/convert/${montant}/${from}/${to}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private handleError(error: any) {
    console.error('Erreur API Devise:', error);
    return throwError(() => new Error(error.error?.message || error.message || 'Erreur serveur'));
  }
}