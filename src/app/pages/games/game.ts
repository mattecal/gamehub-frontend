import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GameService } from '../../services/games.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from '../../models/game';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './games.html',
  styleUrls: ['./games.css']
})
export class GamesComponent implements OnInit {
  
  games: any[] = [];
  filteredGames: any[] = [];
  searchQuery: string = '';
  selectedGenre: string = '';
  availableGenres: string[] = [];

  selectedGame : Game | null = null;

  constructor(
    private gameService: GameService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.gameService.getAllGames().subscribe({
      next: (data: Game[]) => {
        this.games = data;
        this.filteredGames = data;
        this.extractGenres();
        this.cdr.detectChanges(); 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore nel caricamento dei giochi:', err)
    });
  }

  extractGenres() {
    const genres = this.games.map(g => g.genere).filter(g => g);
    this.availableGenres = [...new Set(genres)].sort();
  }

  filterGames() {
    this.filteredGames = this.games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesGenre = this.selectedGenre ? game.genere === this.selectedGenre : true;
      return matchesSearch && matchesGenre;
    });
  }

  apriPopup(game: Game): void {
    this.selectedGame = game;
  }

  chiudiPopup(): void{
    this.selectedGame=null;
  }

 
  apriTrailer(game: Game): void {
    if (!game.rawgId) {
      const youtubeFallback = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' official trailer')}`;
      window.open(youtubeFallback, '_blank');
      return;
    }

    this.gameService.getTrailerFromRawg(game.rawgId).subscribe({
      next: (response: any) => {
        if (response?.results?.length > 0) {
          const videoUrl = response.results[0].data.max;
          window.open(videoUrl, '_blank');
        } else {
          const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' official trailer')}`;
          window.open(youtubeSearchUrl, '_blank');
        }
      },
      error: () => {
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.title + ' official trailer')}`;
        window.open(youtubeSearchUrl, '_blank');
      }
    });
  }
}