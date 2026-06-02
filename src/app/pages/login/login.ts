import { Component, ChangeDetectorRef } from '@angular/core';
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
  isBannedModalOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
      error: (err) => {
        this.caricamento = false;
        if(err.error && err.error.errore ==='ACCOUNT_BANNED'){
          this.isBannedModalOpen = true;
          this.errore = '';
        }
        this.errore = 'Credenziali errate. Riprova.';

        this.cdr.detectChanges();

      }
    });
  }
  closeBannedModal(): void {
    this.isBannedModalOpen = false;
    this.cdr.detectChanges();
  }
}
