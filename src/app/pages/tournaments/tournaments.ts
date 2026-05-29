import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TournamentService } from '../../services/tournament.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './tournaments.html',
  styleUrls: ['./tournaments.css'],
})
export class TournamentsComponent implements OnInit {
  tournaments: any[] = [];
  
  constructor(private tournamentService: TournamentService,
              private cdr:ChangeDetectorRef
  ){}
  ngOnInit(): void {
    this.tournamentService.getAllTournaments().subscribe((data: any) => {
      console.log("TORNEI DAL BACKEND: ",data);
      this.tournaments = data;

      this.cdr.detectChanges();
    });
  }
}
