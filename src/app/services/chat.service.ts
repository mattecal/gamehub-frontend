import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../app.config';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ChatMessage {
    id?: number;
    sender: string;
    content: string;
    timestamp?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private stompClient: Client;
    private messageSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);
    public messages$: Observable<ChatMessage[]> = this.messageSubject.asObservable();

    private messages: ChatMessage[] = [];

    constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            this.stompClient = new Client({
                webSocketFactory: () => new SockJS(environment.wsUrl),
                reconnectDelay: 5000,
            });

            this.stompClient.onConnect = (frame) => {
                this.stompClient.subscribe('/topic/public', (message: Message) => {
                    if (message.body) {
                        const parsedMessage: ChatMessage = JSON.parse(message.body);
                        this.messages.push(parsedMessage);
                        this.messageSubject.next([...this.messages]);
                    }
                });
            };

            this.stompClient.onStompError = (frame) => {
                console.error('Errore WebSocket 🔴', frame.headers['message']);
            };
        } else {
            this.stompClient = new Client(); // Dummy client for SSR
        }
    }



    public loadHistory(): void {
        if (!isPlatformBrowser(this.platformId)) return;
        this.http.get<ChatMessage[]>(`${environment.apiUrl}/chat/history`).subscribe(
            (history) => {
                this.messages = history;
                this.messageSubject.next([...this.messages]);
            },
            (error) => console.error('Errore nel caricamento storico:', error)
        );
    }

    public connect(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.stompClient.activate();
        }
    }

    public disconnect(): void {
        if (isPlatformBrowser(this.platformId) && this.stompClient.active) {
            this.stompClient.deactivate();
        }
    }

    public sendMessage(chatMessage: ChatMessage): void {
        if (this.stompClient.active) {
            this.stompClient.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(chatMessage)
            });
        } else {
            console.error('Non sei connesso alla chat!');
        }
    }
}