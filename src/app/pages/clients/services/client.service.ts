import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError, forkJoin, map, switchMap } from 'rxjs';
import { Client } from '../models/client.model';
import { Facture } from '../../factures/models/facture.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8888/client-service/clients'; // Utilise le chemin gateway + nom du microservice

  constructor(private http: HttpClient) { }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError('getClients'))
      );
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError('getClient'))
      );
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError('createClient'))
      );
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError('updateClient'))
      );
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError('deleteClient'))
      );
  }

  getChiffreAffaires(id: number, annee?: number): Observable<number> {
    let params = new HttpParams();
    if (annee) {
      params = params.set('annee', annee.toString());
    }
    return this.http.get<number>(`${this.apiUrl}/${id}/chiffre-affaires`, { params, headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError('getChiffreAffaires'))
      );
  }

  getChiffreAffairesConverti(id: number, devise: string, annee?: number): Observable<number> {
    let params = new HttpParams().set('devise', devise);
    if (annee) {
      params = params.set('annee', annee.toString());
    }
    return this.http.get<number>(`${this.apiUrl}/${id}/chiffre-affaires/convert`, { params, headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError('getChiffreAffairesConverti'))
      );
  }

  getResteAPayer(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${id}/reste-a-payer`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError('getResteAPayer'))
      );
  }

  getFacturesByStatut(id: number, statut?: string): Observable<Facture[]> {
    let params = statut ? new HttpParams().set('statut', statut) : new HttpParams();
    return this.http.get<Facture[]>(`${this.apiUrl}/${id}/factures`, { params, headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError('getFacturesByStatut'))
      );
  }

  getProduitsSollicites(id: number, limit: number = 5): Observable<any[]> {
    let params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/${id}/produits-sollicites`, { params, headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError('getProduitsSollicites'))
      );
  }

  getActiveClients(): Observable<Client[]> {
    return this.getClients().pipe(
      catchError(this.handleError('getActiveClients'))
    );
  }

  getNewClients(year?: number): Observable<Client[]> {
    return this.getClients().pipe(
      catchError(this.handleError('getNewClients'))
    );
  }

  getTopClientsByPurchases(limit: number = 5): Observable<{ clientId: number, clientNom: string, chiffreAffaires: number }[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/fideles`, {
      params: { limit: limit.toString() },
      headers: this.getAuthHeaders()
    }).pipe(
      map(clients => clients.map(c => ({
        clientId: c.id,
        clientNom: c.name,
        chiffreAffaires: this.getChiffreAffaires(c.id).pipe(map(ca => ca || 0)) // Fetch CA dynamically
      }))),
      switchMap(mappedClients => forkJoin(mappedClients.map(mc => mc.chiffreAffaires.pipe(
        map(ca => ({ clientId: mc.clientId, clientNom: mc.clientNom, chiffreAffaires: ca }))
      )))),
      catchError(this.handleError('getTopClientsByPurchases'))
    );
  }

  getRevenueByClient(year?: number): Observable<{ clientId: number, clientNom: string, revenue: number }[]> {
    return this.getTopClientsByPurchases(100).pipe(
      map(clients => clients.map(c => ({
        clientId: c.clientId,
        clientNom: c.clientNom,
        revenue: c.chiffreAffaires
      }))),
      catchError(this.handleError('getRevenueByClient'))
    );
  }

  getClientsWithDebts(): Observable<{ clientId: number, clientNom: string, debt: number }[]> {
    return this.getClients().pipe(
      switchMap(clients => forkJoin(clients.map(client =>
        this.getResteAPayer(client.id).pipe(
          map(debt => ({ clientId: client.id, clientNom: client.name, debt }))
        )
      ))),
      catchError(this.handleError('getClientsWithDebts'))
    );
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }
}