import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TournamentService } from '../../services/tournament.service';
import { GameService } from '../../services/games.service';
import { AuthService } from '../../services/auth.service';
import { Game } from '../../models/game';

@Component({
  selector: 'app-crea-torneo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crea-torneo.html',
  styleUrls: ['./crea-torneo.css']
})
export class CreaTorneoComponent implements OnInit {
  title: string = '';
  selectedGameId: number | null = null;
  registrationDeadLine: string = '';
  description: string = '';
  gamesList: Game[] = [];
  
  isLoading = false;
  message = '';
  messageType = '';

  constructor(
    private tournamentService: TournamentService,
    private gameService: GameService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    // Controllo di sicurezza: se non sei Organizzatore, ti rispedisce alla Home
    if (role !== 'ROLE_ORGANIZER' && role !== 'ORGANIZER') {
      this.router.navigate(['/']);
    } else {
      this.loadGames();
    }
  }

  loadGames() {
    this.gameService.getCachedGames().subscribe({
      next: (games) => {
        this.gamesList = games;
      },
      error: (err) => {
        console.error('Errore nel caricamento dei giochi', err);
      }
    });
  }

  submitCreate() {
    if (!this.title || !this.selectedGameId || !this.registrationDeadLine) {
      this.message = 'COMPILA TUTTI I CAMPI CORRETTAMENTE.';
      this.messageType = 'error';
      return;
    }

    this.isLoading = true;
    this.message = 'INIZIALIZZAZIONE TORNEO IN CORSO...';
    this.messageType = '';

    this.tournamentService.createTournament(
      this.title,
      this.selectedGameId,
      this.registrationDeadLine,
      this.description
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = 'TORNEO CREATO CON SUCCESSO!';
        this.messageType = 'success';
        setTimeout(() => {
          this.router.navigate(['/tornei']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.message = err.error?.message || 'ERRORE NELLA CREAZIONE DEL TORNEO.';
        this.messageType = 'error';
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}