import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../app.config';
import { Review } from '../models/review';

@Injectable({
    providedIn: 'root'
})

export class ReviewService {
    constructor(private http: HttpClient) { }

    getAllReviews(): Observable<Review[]> {
        return this.http.get<Review[]>(`${environment.apiUrl}/reviews`);
    }

    addReview(comment: string, rating: number): Observable<Review> {
        const token = sessionStorage.getItem('gh_token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token || ''}`
        });

        const body = {
            rating: rating,
            comment: comment,
            userId: null,
            gameId: null,
            tournamentId: null
        };

        return this.http.post<Review>(`${environment.apiUrl}/reviews`, body, { headers });
    }
}