import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TournamentService } from '../../services/tournament.service';
import { CommonModule } from '@angular/common';
import { Tournament } from '../../models/tournament';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, Chart, registerables } from 'chart.js';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [RouterModule, CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './tournament-detail.html',
  styleUrls: ['./tournament-detail.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
  
})
export class TournamentDetailComponent implements OnInit, OnDestroy {
  tournament?: Tournament;
  isRatingModalOpen = false;
  selectedScore = 0;
  hoveredScore = 0;
  isPlayer = false;
  currentUserId: number | null = null;
  isLoading = true;
  mostraMessaggioSuccesso = false;
  savedGameId: string | null = null;
  gameIdInput: string = '';
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  isTournamentStarted: boolean = false;
  private timerInterval: any;
  myMatchData: any = null;

  // Chart configuration
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Punteggio Squadre',
        backgroundColor: 'rgba(106, 90, 205, 0.6)',
        borderColor: '#6a5acd',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(155, 140, 255, 0.8)'
      }
    ]
  };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, ticks: { color: '#cfcfcf' }, grid: { color: '#3a3a5a' } },
      x: { ticks: { color: '#cfcfcf' }, grid: { color: '#3a3a5a' } }
    },
    plugins: {
      legend: { labels: { color: 'white', font: { family: 'Orbitron' } } }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private tournamentService: TournamentService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const userRole = this.authService.getUserRole();
    this.isPlayer = userRole === 'PLAYER' || userRole === 'ROLE_PLAYER';
    // Try to obtain current user id if method exists
    if ((this.authService as any).getUserId) {
      this.currentUserId = (this.authService as any).getUserId();
    }

    this.tournamentService.getTournamentByIdCached(id).subscribe({
      next: (data: Tournament) => {
        this.tournament = data;
        this.loadGameId();
        this.setupChartData();
        this.startTimer();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Errore nel caricamento del torneo:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get isUserJoined(): boolean {
    // Controlla se la lista squadre contiene una squadra con lo stesso ID dell'utente
    if (!this.tournament || !this.tournament.teams || this.currentUserId === null) return false;
    return this.tournament.teams.some(team => team.id === this.currentUserId);
  }

  trackByTeamId(index: number, team: any): number {
    return team.id;
  }

  getSafeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  /** fallback image for tournament */
  getTournamentImageUrl(): SafeUrl {
    const img = this.tournament?.gameImageUrl ?? this.tournament?.game?.coverUrl;
    return img ? this.getSafeImageUrl(img) : ('assets/default-game.jpg' as any);
  }

  private setupChartData(): void {
    if (this.tournament && this.tournament.teams) {
      const sortedTeams = [...this.tournament.teams].sort((a, b) => b.score - a.score);
      this.barChartData.labels = sortedTeams.map(t => t.name);
      this.barChartData.datasets[0].data = sortedTeams.map(t => t.score);
    }
  }

  openRatingModal(): void {
    this.isRatingModalOpen = true;
    this.selectedScore = 0;
  }

  closeRatingModal(): void {
    this.isRatingModalOpen = false;
  }

  setRating(score: number): void {
    this.selectedScore = score;
  }

  submitRating(): void {
    if (this.selectedScore === 0) return;
    if (!this.tournament || this.currentUserId === null) return;

    this.tournamentService.rateTournament(this.tournament.id, this.currentUserId, this.selectedScore)
      .subscribe({
        next: () => {
          //alert('Grazie per il tuo voto!');
          this.closeRatingModal();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.mostraMessaggioSuccesso = true;
          this.cdr.detectChanges();
          
          setTimeout(() => {
            this.mostraMessaggioSuccesso = false;
            this.cdr.detectChanges();
          }, 5000);
          
          // Invalidate cache and reload tournament data to refresh rating
          this.tournamentService.invalidateTournamentCache(this.tournament!.id);
          this.tournamentService.getTournamentByIdCached(this.tournament!.id).subscribe(data => {
            this.tournament = data;
            this.setupChartData();
            this.cdr.detectChanges();
          });
        },
        error: err => console.error('Errore salvataggio rating', err)
      });
  }

  joinTournament(): void {
    // Controlliamo che i dati siano caricati e l'utente sia loggato
    if (!this.tournament || this.currentUserId === null) {
        alert('Devi essere loggato per iscriverti!');
        return;
    }
    this.tournamentService.joinTournament(this.tournament.id, this.currentUserId)
      .subscribe({
        next: () => {
          alert("Iscrizione avvenuta con successo! Benvenuto nell'arena.");
          
          // Sfruttiamo il sistema di cache già presente per aggiornare subito 
          // i grafici e la lista squadre in tempo reale
          this.tournamentService.invalidateTournamentCache(this.tournament!.id);
          this.tournamentService.getTournamentByIdCached(this.tournament!.id).subscribe(data => {
            this.tournament = data;
            // Aggiorna i dati per i grafici e triggera il change detection
            this.setupChartData();
            this.cdr.detectChanges();
          });
        },
        error: err => {
          console.error('Errore durante l\'iscrizione', err);
          // Messaggio in caso di errore (es. sei già iscritto)
          alert('Si è verificato un errore o sei già iscritto al torneo.');
        }
      });
  }

   loadGameId(): void {
    if (this.currentUserId !== null && this.tournament) {
      this.tournamentService.getGameId(this.tournament.id, this.currentUserId).subscribe({
        next: (res: any) => {
          if (res && res.gameId) {
            this.savedGameId = res.gameId;
            this.cdr.detectChanges(); // Aggiorna la grafica
          }
        },
        error: (err) => console.error('Errore nel caricamento del Game ID', err)
      });
    }
  }
  submitGameId(): void {
    if (!this.gameIdInput || this.currentUserId === null || !this.tournament) return;
    
    this.tournamentService.saveGameId(this.tournament.id, this.currentUserId, this.gameIdInput).subscribe({
      next: () => {
        this.savedGameId = this.gameIdInput; // Lo salva localmente così l'interfaccia si aggiorna scomparendo
        alert('Game ID salvato con successo!');
        this.cdr.detectChanges();
      },
      error: (err) => alert('Impossibile salvare il Game ID: ' + (err.error?.error || 'Errore sconosciuto'))
    });
  }

  startTimer(): void {
    // Se non c'è una data, consideriamolo iniziato
    if (!this.tournament || !this.tournament.startDate) {
      this.isTournamentStarted = true;
      this.loadMyMatch();
      return;
    }
    // Angular riceve la data come "YYYY-MM-DDTHH:mm:ss", il browser la legge nell'orario locale
    const startDateTime = new Date(this.tournament.startDate).getTime();
    // Aggiorna il timer ogni secondo (1000 millisecondi)
    this.timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = startDateTime - now;
      if (distance <= 0) {
        // Il tempo è scaduto!
        clearInterval(this.timerInterval);
        this.isTournamentStarted = true;
        this.days = 0; this.hours = 0; this.minutes = 0; this.seconds = 0;
        this.loadMyMatch();
      } else {
        // Calcola giorni, ore, minuti e secondi
        this.isTournamentStarted = false;
        this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
        this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
      }
      
      // Avvisa Angular di aggiornare la grafica dello schermo
      this.cdr.detectChanges(); 
    }, 1000);
  }
  // Questo serve per spegnere il timer quando l'utente cambia pagina (evita lag)
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadMyMatch(): void {
    if (this.currentUserId === null || !this.tournament) return;
    this.tournamentService.getMyMatch(this.tournament.id, this.currentUserId).subscribe({
      next: (res) => {
        this.myMatchData = res;
        this.cdr.detectChanges();
      },
      error: err => console.log("Errore caricamento match", err)
    });
  }

  reportResult(isWinner: boolean): void {
    if (!this.myMatchData || !this.myMatchData.matchId || this.currentUserId === null) return;
    
    this.tournamentService.reportMatchResult(this.myMatchData.matchId, this.currentUserId, isWinner)
      .subscribe({
        next: () => {
          alert('Risultato inviato con successo! In attesa della conferma dell\'avversario...');
          this.loadMyMatch(); // Ricarica per bloccare il doppio voto
        },
        error: (err) => alert('Errore: ' + (err.error?.error || 'Impossibile salvare il risultato'))
      });
  }

}
