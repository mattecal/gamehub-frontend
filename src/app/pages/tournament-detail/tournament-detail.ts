import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TournamentService } from '../../services/tournament.service';
import { CommonModule } from '@angular/common';
import { Tournament } from '../../models/tournament';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './tournament-detail.html',
  styleUrls: ['./tournament-detail.css']
})
export class TournamentDetailComponent implements OnInit {

  tournament: Tournament | null = null;

  constructor(
    private route: ActivatedRoute,
    private tournamentService: TournamentService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tournamentService.getTournamentById(id).subscribe({
      next: (data: Tournament) => {
        this.tournament = data;
      },
      error: (err) => console.error('Errore nel caricamento dei dettagli del torneo:', err)
    });
  }
}
