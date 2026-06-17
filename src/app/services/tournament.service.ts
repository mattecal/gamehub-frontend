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

  createTournament(title: string, gameId: number, registrationDeadLine: string, description: string): Observable<Tournament> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.post<Tournament>(`${environment.apiUrl}/tournaments`, {
    title,
    gameId,
    registrationDeadLine,
    description
  }, { headers });
  }

}

