import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TournamentService } from '../../services/tournament.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Tournament } from '../../models/tournament';
import { FormsModule } from '@angular/forms';
import { GameService} from '../../services/games.service';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tournaments.html',
  styleUrls: ['./tournaments.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TournamentsComponent implements OnInit {
  tournaments: Tournament[] = [];
  isLoading = true;
  selectedGameTitle: string = '';
  avalaibleGames: string[] = [];
  filterMode : 'all' | 'library' = 'all';
  libraryGameIds: number[] = [];

  constructor(
    private tournamentService: TournamentService,
    private gameService : GameService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.tournamentService.getAllTournaments().subscribe({
      next: (data: Tournament[]) => {
        this.tournaments = data;
        this.avalaibleGames = [...new Set(data.map(t=> t.game?.title).filter(title => title))].sort();
        this.isLoading = false;
        this.gameService.getCachedGames().subscribe( {next : (libGames)=> {this.libraryGameIds = libGames.map(g=>g.id);
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 
        error : (err)=> {
          console.error("Errore caricamento Libreria", err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }, 
    error: err => {
    console.error("Errore caricamento Tornei", err);
    this.isLoading=false;
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

  getfilteredTournaments() : Tournament[]{
    if(this.filterMode === 'library') return this.tournaments.filter(t => t.game && this.libraryGameIds.includes(t.game.id));
    return this.tournaments;
  }
}
