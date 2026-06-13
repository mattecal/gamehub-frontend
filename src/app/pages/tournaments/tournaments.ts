import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TournamentService } from '../../services/tournament.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Tournament } from '../../models/tournament';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tournaments.html',
  styleUrls: ['./tournaments.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentsComponent implements OnInit {
  tournaments: Tournament[] = [];
  isLoading = true;

  constructor(
    private tournamentService: TournamentService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.tournamentService.getAllTournaments().subscribe({
      next: (data: Tournament[]) => {
        this.tournaments = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Errore nel caricamento dei tornei:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Track by tournament id */
  trackByTournamentId(index: number, tournament: Tournament): number {
    return tournament.id;
  }

  /** Safe image URL with fallback */
  getTournamentImageUrl(tournament: Tournament): SafeUrl {
    const img = tournament.gameImageUrl ?? tournament.game?.coverUrl;
    return img ? this.sanitizer.bypassSecurityTrustUrl(img) : ('assets/default-game.jpg' as any);
  }
}
