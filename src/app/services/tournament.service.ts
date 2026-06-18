import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../app.config';
import { Tournament } from '../models/tournament';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  private tournamentCache = new Map<number, Observable<Tournament>>();

  /**
   * Returns cached tournament observable or fetches and caches it.
   */
  getTournamentByIdCached(id: number): Observable<Tournament> {
    if (!this.tournamentCache.has(id)) {
      const obs = this.http.get<Tournament>(`${environment.apiUrl}/tournaments/${id}`).pipe(
        shareReplay(1)
      );
      this.tournamentCache.set(id, obs);
    }
    return this.tournamentCache.get(id) as Observable<Tournament>;
  }

  /**
   * Invalidate cache for a tournament (e.g., after rating).
   */
  invalidateTournamentCache(id: number): void {
    this.tournamentCache.delete(id);
  }

  getAllTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(`${environment.apiUrl}/tournaments`);
  }

  getTournamentById(id: number): Observable<Tournament> {
    return this.http.get<Tournament>(`${environment.apiUrl}/tournaments/${id}`);
  }

  rateTournament(tournamentId: number, userId: number, score: number): Observable<any> {
    const url = `${environment.apiUrl}/tournaments/${tournamentId}/rate?userId=${userId}&score=${score}`;
    return this.http.post(url, {});
  }

  joinTournament(tournamentId: number, userId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // Sfruttiamo l'endpoint che avevamo già nel TournamentController del backend
    return this.http.post(`${environment.apiUrl}/tournaments/${tournamentId}/join/${userId}`, {}, { headers });
  }

  // Salva il Game ID
  saveGameId(tournamentId: number, userId: number, gameId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    const url = `${environment.apiUrl}/tournaments/${tournamentId}/player-id?userId=${userId}&gameId=${gameId}`;
    return this.http.post(url, {}, { headers });
  }
  // Recupera il Game ID
  getGameId(tournamentId: number, userId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    const url = `${environment.apiUrl}/tournaments/${tournamentId}/player-id/${userId}`;
    return this.http.get(url, { headers });
  }

  createTournament(title: string, gameId: number, registrationDeadLine: string, description: string, maxParticipants: number): Observable<Tournament> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.post<Tournament>(`${environment.apiUrl}/tournaments`, {
    title,
    gameId,
    registrationDeadLine,
    description,
    maxParticipants
  }, { headers });
  }

}

