import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errore = '';
  caricamento = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    if (!this.username || !this.password) {
      this.errore = 'Inserisci username e password.';
      return;
    }

    this.caricamento = true;
    this.errore = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.caricamento = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.caricamento = false;
        this.errore = 'Credenziali errate. Riprova.';
      }
    });
  }
}
