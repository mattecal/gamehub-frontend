import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from './services/message.service';

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

  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService

  ) { }

  ngOnInit(): void {
    this.messageService.unreadCount$.subscribe(count => {
      this.messaggiNonLetti = count;
      this.cdr.detectChanges();
    });
  }

  logout(): void {
    this.authService.logout();
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
