import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  menuAperto = false;
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
  toggleMenu() {
    this.menuAperto = !this.menuAperto;
  }
  chiudiEdEsci() {
    this.menuAperto = false;
    this.logout(); // Richiama il tuo metodo logout esistente!
  }
}
