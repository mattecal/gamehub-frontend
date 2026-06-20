import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confermaPassword = '';
  errore = '';
  caricamento = false;
  ruolo = 'PLAYER';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  register(): void {
    if (!this.username || !this.email || !this.password || !this.confermaPassword) {
      this.errore = 'Tutti i campi sono obbligatori.';
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.errore = 'Inserisci un indirizzo email valido (es. utente@dominio.com).';
      return;
    }

    if (this.password !== this.confermaPassword) {
      this.errore = 'Le password non coincidono.';
      return;
    }
    if (this.password.length < 6) {
      this.errore = 'La password deve essere di almeno 6 caratteri.';
      return;
    }

    this.caricamento = true;
    this.errore = '';

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.ruolo

    }).subscribe({
      next: () => {
        this.caricamento = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.caricamento = false;
        this.errore = err?.error?.message ?? 'Registrazione fallita. Riprova.';
      }
    });
  }
}
