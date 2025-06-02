import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:8888/authentificationservice/auth'; // Gateway URL for auth
  private baseUrl = 'http://localhost:8888/authentificationservice'; // Gateway URL for users/roles

  constructor(private http: HttpClient) { }

  login(credentials: { username: string, password: string }): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', credentials.username);
    body.set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(`${this.authUrl}/login`, body.toString(), { headers })
      .pipe(
        map(response => {
          if (response['access-token'] && response['refresh-token']) {
            localStorage.setItem('accessToken', response['access-token']);
            localStorage.setItem('refreshToken', response['refresh-token']);
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  get loggedIn(): boolean {
    return localStorage.getItem('accessToken') !== null;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users`, { headers: this.getAuthHeaders() })
      .pipe(catchError(error => {
        console.error('Get users error:', error);
        throw error;
      }));
  }

  addUser(user: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users`, user, { headers: this.getAuthHeaders() })
      .pipe(catchError(error => {
        console.error('Add user error:', error);
        throw error;
      }));
  }

  addRole(role: { roleName: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/roles`, role, { headers: this.getAuthHeaders() })
      .pipe(catchError(error => {
        console.error('Add role error:', error);
        throw error;
      }));
  }

  addRoleToUser(data: { username: string, roleName: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/addRoleToUser`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(error => {
        console.error('Add role to user error:', error);
        throw error;
      }));
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return of(null);
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`
    });
    return this.http.get<any>(`${this.baseUrl}/users/refreshToken`, { headers })
      .pipe(
        map(response => {
          if (response['access-token']) {
            localStorage.setItem('accessToken', response['access-token']);
          }
          return response;
        }),
        catchError(error => {
          console.error('Refresh token error:', error);
          throw error;
        })
      );
  }
}