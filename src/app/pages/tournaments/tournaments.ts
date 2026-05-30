import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TournamentService } from '../../services/tournament.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Tournament } from '../../models/tournament';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tournaments.html',
  styleUrls: ['./tournaments.css'],
})
export class TournamentsComponent implements OnInit {
  tournaments: Tournament[] = [];

  constructor(
    private tournamentService: TournamentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tournamentService.getAllTournaments().subscribe({
      next: (data: Tournament[]) => {
        this.tournaments = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore nel caricamento dei tornei:', err)
    });
  }
}
