import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GameService } from '../../services/games.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './games.html',
  styleUrls: ['./games.css']
})
export class GamesComponent implements OnInit {
  
  games: any[] = [];

  constructor(
    private gameService: GameService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.gameService.getAllGames().subscribe({
      next: (data: any) => {
        console.log("GIOCHI DAL BACKEND:", data);
        this.games = data;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => console.error("Errore caricamento giochi:", err)
    });
  }

  apriTrailer(game: any) {
    if (!game.rawgId) {
      const youtubeFallback = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' official trailer')}`;
      window.open(youtubeFallback, '_blank');
      return;
    }

    this.gameService.getTrailerFromRawg(game.rawgId).subscribe({
      next: (response: any) => {
        if (response.results && response.results.length > 0) {
          const videoUrl = response.results[0].data.max; 
          window.open(videoUrl, '_blank');
        } else {
          console.log("RAWG non ha il trailer, fallback su YouTube...");
          const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' official trailer')}`;
          window.open(youtubeSearchUrl, '_blank');
        }
      },
      error: (err) => {
        console.error("Errore RAWG:", err);
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' official trailer')}`;
        window.open(youtubeSearchUrl, '_blank');
      }
    });
  }
}