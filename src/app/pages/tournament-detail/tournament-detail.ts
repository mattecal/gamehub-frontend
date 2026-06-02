import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TournamentService } from '../../services/tournament.service';
import { CommonModule } from '@angular/common';
import { Tournament } from '../../models/tournament';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [RouterModule, CommonModule, BaseChartDirective],
  templateUrl: './tournament-detail.html',
  styleUrls: ['./tournament-detail.css']
})
export class TournamentDetailComponent implements OnInit {

  /*tournament: Tournament | null = null;*/
  tournament?: Tournament;

  // Configurazione del Grafico a barre
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Punteggio Squadre',
        backgroundColor: 'rgba(106, 90, 205, 0.6)', // Il tuo viola con opacità
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tournamentService.getTournamentById(id).subscribe({
      next: (data: Tournament) => {
        this.tournament = data;
        this.setupChartData();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore nel caricamento dei dettagli del torneo:', err)
    });
  }

  private setupChartData() : void{
    if (this.tournament && this.tournament.teams){
      const sortedTeams = [...this.tournament.teams].sort((a,b) => b.score - a.score);
      this.barChartData.labels = sortedTeams.map(t=>t.name);
      this.barChartData.datasets[0].data = sortedTeams.map(t=>t.score);
    }
  }
}
