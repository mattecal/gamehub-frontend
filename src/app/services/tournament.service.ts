import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../app.config';
import { Tournament } from '../models/tournament';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {

  constructor(private http: HttpClient) {}

  getAllTournaments() {
    return this.http.get<Tournament[]>(`${environment.apiUrl}/tournaments`);
  }
  getTournamentById(id: number) {
  return this.http.get<Tournament>(`${environment.apiUrl}/tournaments/${id}`);
  }

  rateTournament(tournamentId: number, userId: number, score: number) {
  const url = `${environment.apiUrl}/tournaments/${tournamentId}/rate?userId=${userId}&score=${score}`;
    return this.http.post(url, {});
  }

}

