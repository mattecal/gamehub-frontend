import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Game } from '../models/game';
import { environment } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private apiUrl = `${environment.apiUrl}/games`;

  constructor(private http: HttpClient) { }

  getAllGames(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getGameById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
    
  private gamesCache$: Observable<Game[]> | null = null;
  getCachedGames(): Observable<Game[]> {
    if (!this.gamesCache$) {
      this.gamesCache$ = this.http.get<Game[]>(this.apiUrl).pipe(
        shareReplay(1)
      );
    }
    return this.gamesCache$;
  }

  refreshGamesCache(): void {
    this.gamesCache$ = this.http.get<Game[]>(this.apiUrl).pipe(shareReplay(1));
  }

  clearCache(): void{
    this.gamesCache$=null;
  }

  getTrailerFromRawg(rawgId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${rawgId}/trailer`);
  }

  searchGamesOnRawg(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?query=${encodeURIComponent(query)}`);
  }

  saveGame(game: any): Observable<any> {
    return this.http.post(this.apiUrl, game);
  }

  deleteGame(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}