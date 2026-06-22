import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Game } from "../models/game";
import { environment } from "../app.config";

@Injectable({
    providedIn: 'root'
}) export class LibraryService{
    private apiUrl = `${environment.apiUrl}/users/me/library`;

    constructor(private http: HttpClient) {}

    getMyLibrary(): Observable<Game[]> {
        return this.http.get<Game[]>(this.apiUrl);
    }

    addGame(gameId : number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${gameId}`, {}, {responseType: "text"});
    }

    removeGame(gameId: number): Observable<any>{
        return this.http.delete(`${this.apiUrl}/${gameId}`, {responseType: "text"});
    }
}