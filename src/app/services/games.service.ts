import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // Il trailer viene ora richiesto tramite backend (evita di esporre la chiave RAWG nel frontend)
  getTrailerFromRawg(rawgId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${rawgId}/trailer`);
  }
}