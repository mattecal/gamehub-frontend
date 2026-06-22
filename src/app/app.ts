import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthResponse, AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from './services/message.service';
import { GameService } from './services/games.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  menuAperto = false;
  messaggiNonLetti = 0;

  currentUser: AuthResponse | null = null;

  constructor(
    public authService: AuthService,
    private gameService: GameService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.messageService.unreadCount$.subscribe(count => {
      this.messaggiNonLetti = count;
      this.cdr.detectChanges();
    });
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges();
    });
  }

  logout(): void {
    this.authService.logout();
    this.gameService.clearCache();
    this.router.navigate(['/']);
  }
  toggleMenu() {
    this.menuAperto = !this.menuAperto;
  }
  chiudiEdEsci() {
    this.menuAperto = false;
    this.logout();
  }
}
