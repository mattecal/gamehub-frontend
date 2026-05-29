import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class GameService {

  private apiUrl = 'http://localhost:8080/api/games';
  private rawgApiKey = '709be523349e478da3ca8e56097e1a61';
  constructor(private http: HttpClient) { }

  getAllGames(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getGameById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getTrailerFromRawg(rawgId: string):Observable<any>{
    return this.http.get(`https://api.rawg.io/api/games/${rawgId}/movies?key=${this.rawgApiKey}`);
  }
}