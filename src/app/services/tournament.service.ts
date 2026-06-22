import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../app.config';
import { Tournament } from '../models/tournament';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

// TIPS: I Service in Angular servono per incapsulare la logica di business e le chiamate API.
// @Injectable({ providedIn: 'root' }) lo rende disponibile in tutta l'app tramite Dependency Injection.
@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  // TIPS: HttpClient è il modulo usato per fare richieste REST al backend (GET, POST, ecc).
  constructor(private http: HttpClient, private authService: AuthService) { }

  private tournamentCache = new Map<number, Observable<Tournament>>();

  getTournamentByIdCached(id: number): Observable<Tournament> {
    if (!this.tournamentCache.has(id)) {
      const obs = this.http.get<Tournament>(`${environment.apiUrl}/tournaments/${id}`).pipe(
        shareReplay(1)
      );
      this.tournamentCache.set(id, obs);
    }
    return this.tournamentCache.get(id) as Observable<Tournament>;
  }

  invalidateTournamentCache(id: number): void {
    this.tournamentCache.delete(id);
  }

  // TIPS: Ritorna un Observable, che è un flusso asincrono. I Componenti Angular
  // si "iscriveranno" (subscribe) a questo Observable per ricevere il JSON parsato in un array di Tournament.
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
    return this.http.post(`${environment.apiUrl}/tournaments/${tournamentId}/join/${userId}`, {}, { headers });
  }

  saveGameId(tournamentId: number, userId: number, gameId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const url = `${environment.apiUrl}/tournaments/${tournamentId}/player-id?userId=${userId}&gameId=${gameId}`;
    return this.http.post(url, {}, { headers });
  }

  getGameId(tournamentId: number, userId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const url = `${environment.apiUrl}/tournaments/${tournamentId}/player-id/${userId}`;
    return this.http.get(url, { headers });
  }

  createTournament(title: string, gameId: number, startDate: string, description: string, maxParticipants: number): Observable<Tournament> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.post<Tournament>(`${environment.apiUrl}/tournaments`, {
    title,
    gameId,
    startDate,
    description,
    maxParticipants
  }, { headers });
  }

  reportMatchResult(matchId: number, userId: number, isWinner: boolean): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${environment.apiUrl}/tournaments/match/${matchId}/report?userId=${userId}&isWinner=${isWinner}`;
    return this.http.post(url, {}, { headers });
  }

  getMyMatch(tournamentId: number, userId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get(`${environment.apiUrl}/tournaments/${tournamentId}/my-match/${userId}`, { headers });
  }

  uploadScreenshot(matchId: number, userId: number, file: File): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const formData = new FormData();
    formData.append('file', file);
    const url = `${environment.apiUrl}/tournaments/match/${matchId}/upload-screenshot?userId=${userId}`;
    return this.http.post(url, formData, { headers });
  }

  getPlayerOfTheMonth(): import ('rxjs').Observable<any> {
    return this.http.get(`${environment.apiUrl}/tournaments/potm`);
  }

}

