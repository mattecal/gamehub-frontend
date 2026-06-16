import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TournamentService } from '../../services/tournament.service';
import { CommonModule } from '@angular/common';
import { Tournament } from '../../models/tournament';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, Chart, registerables } from 'chart.js';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [RouterModule, CommonModule, BaseChartDirective],
  templateUrl: './tournament-detail.html',
  styleUrls: ['./tournament-detail.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
  
})
export class TournamentDetailComponent implements OnInit {
  tournament?: Tournament;
  isRatingModalOpen = false;
  selectedScore = 0;
  hoveredScore = 0;
  isPlayer = false;
  currentUserId: number | null = null;
  isLoading = true;
  mostraMessaggioSuccesso = false;

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
        this.setupChartData();
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
          this.mostraMessaggioSuccesso = true;
          this.cdr.detectChanges();
          
          setTimeout(() => {
            this.mostraMessaggioSuccesso = false;
            this.cdr.detectChanges();
          }, 3000);
          this.closeRatingModal();
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
}
