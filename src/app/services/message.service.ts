import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../app.config';
import { Message } from '../models/message';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    if (this, authService.isLoggedIn()) {
      this.refreshUnreadCount();
    }
  }

  getMessagesForCurrentUser(): Observable<Message[]> {
    return this.http.get<Message[]>(`${environment.apiUrl}/notifications/my-messages`).pipe(
      tap(messages => {
        const unread = messages.filter(m => !m.read).length;
        this.unreadCountSubject.next(unread);
      })
    );
  }

  refreshUnreadCount(): void {
    this.getMessagesForCurrentUser().subscribe({
      error: (err) => console.error('Errore nel rinfrescare il contatore notifiche:', err)
    });
  }

  sendMessage(receiverId: number, text: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });


    const body = {
      userId: receiverId,
      message: text,
      type: 'MESSAGE',
      relatedId: null,
      senderUsername: null
    };

    return this.http.post(`${environment.apiUrl}/notifications`, body, { headers, responseType: 'text' });
  }

  markAsRead(id: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notifications/${id}/read`, {}).pipe(
      tap(() => {
        const currentCount = this.unreadCountSubject.value;
        if (currentCount > 0) {
          this.unreadCountSubject.next(currentCount - 1);
        }
      })
    );
  }
}
