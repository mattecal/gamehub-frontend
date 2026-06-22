import { Component, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import { GameService } from '../../services/games.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from '../../models/game';
import { AuthService } from '../../services/auth.service';


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
  rawgSearchResults: any[] = [];

  searchQuery: string = '';
  selectedGenre: string = '';
  availableGenres: string[] = [];
  giochiDaMostrare: any[] = [];


  sourceMode:'local' | 'rawg' = 'local';
  selectedGame : any | null = null;

  constructor(
    private gameService: GameService,
    public authService: AuthService,
  ) {}


  ngOnInit(): void {
    this.caricaGiochiLocali();
  }

  caricaGiochiLocali(): void{
    this.gameService.getAllGames().subscribe({
      next: (data: any[]) => {
        this.games = data;
        this.filteredGames = data;
        this.extractGenres();
        this.giochiDaMostrare = this.filteredGames;
      },
      error: (err) => console.error('Errore nel caricamento dei giochi:', err)
    });
  }
  

  extractGenres() {
    const genres = this.games.map(g => g.genere).filter(g => g);
    this.availableGenres = [...new Set(genres)].sort();
  }

  setSourceMode(mode: 'local' | 'rawg'): void{
    this.sourceMode = mode;
    this.searchQuery = '';
    this.selectedGenre = '';
    this.rawgSearchResults = [];
    if(mode === 'local'){
      this.filteredGames = this.games;
    }
    this.giochiDaMostrare = mode === 'local' ? this.filteredGames : this.rawgSearchResults;
  }

  onSearchInput():void{
    if(this.sourceMode === 'local'){
      this.filterGames();
    }else{
      this.cercaSuRawg();
    }
  }

  filterGames() {
    this.filteredGames = this.games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesGenre = this.selectedGenre ? game.genere === this.selectedGenre : true;
      return matchesSearch && matchesGenre;
    });
    this.giochiDaMostrare = this.filteredGames;
  }

  cercaSuRawg():void{
    if(this.searchQuery.trim().length < 3){
      this.rawgSearchResults = [];
      this.giochiDaMostrare = [];
      return;
    }
    this.gameService.searchGamesOnRawg(this.searchQuery).subscribe({
      next: (response : any) =>{
        this.rawgSearchResults = response || [];
        this.giochiDaMostrare = this.rawgSearchResults;
      },
      error:(err) => console.error('Errore durante la ricerca globale su RAWG: ', err),
    });
  }

  importaGiocoInArena(gameFromRawg: any, event: Event): void {
    event.stopPropagation();

    const nuovoGioco = {
      title: gameFromRawg.title,
      genere: gameFromRawg.genere || 'Generico',
      coverUrl: gameFromRawg.backgroundImage, 
      rating: gameFromRawg.rating,
      rawgId: gameFromRawg.slug
    };

    this.gameService.saveGame(nuovoGioco).subscribe({
      next: () => {
        alert(`"${nuovoGioco.title}" salvato con successo nel database di GameHub Arena!`);
        this.caricaGiochiLocali(); 
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        alert('Impossibile salvare il gioco. Forse esiste già?');
      }
    });
  }

  apriPopup(game: any): void {
    this.selectedGame = {
      id: game.id, 
      
      title: game.title || game.name || 'Titolo sconosciuto',
      coverUrl: game.coverUrl || game.backgroundImage || 'assets/images/default-cover.png',
      genere: game.genere || 'Generico',
      rating: game.rating || 0,
      
      rawgId: game.rawgId ? game.rawgId.toString() : (game.slug ? game.slug: ''),
      
      description: game.description || 'Dettagli disponibili nel trailer ufficiale.'
    };
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