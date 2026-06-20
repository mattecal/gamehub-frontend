import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

    constructor(private http: HttpClient) {
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            debug: (msg: string) => console.log(msg),
            reconnectDelay: 5000,
        });

        this.stompClient.onConnect = (frame) => {
            console.log('Connesso al WebSocket! 🟢');

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
    }

    public loadHistory(): void {
        this.http.get<ChatMessage[]>('http://localhost:8080/api/chat/history').subscribe(
            (history) => {
                this.messages = history;
                this.messageSubject.next([...this.messages]);
            },
            (error) => console.error('Errore nel caricamento storico:', error)
        );
    }

    public connect(): void {
        this.stompClient.activate();
    }

    public disconnect(): void {
        if (this.stompClient.active) {
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