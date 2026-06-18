import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GameService } from '../../services/games.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from '../../models/game';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-games',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './games.html',
  styleUrls: ['./games.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Mantenuta l'ottimizzazione OnPush!
})
export class GamesComponent implements OnInit {

  games: any[] = [];               // Cambiato in any[] per la massima flessibilità con RAWG
  filteredGames: any[] = [];
  rawgSearchResults: any[] = [];
  giochiDaMostrare: any[] = [];

  searchQuery: string = '';
  selectedGenre: string = '';
  availableGenres: string[] = [];

  sourceMode: 'local' | 'rawg' = 'local';
  selectedGame: any | null = null;

  isLoading: boolean = true;
  canImport: boolean = false;

  constructor(
    private gameService: GameService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.canImport = role === 'ROLE_ADMIN' || role === 'ADMIN' ||
      role === 'ROLE_ORGANIZER' || role === 'ORGANIZER';
    this.caricaGiochiLocali();
  }

  caricaGiochiLocali(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.gameService.getCachedGames().subscribe({
      next: (data: Game[]) => {
        this.games = data;
        this.filteredGames = data;
        this.extractGenres();
        this.updateDisplayedGames();
        this.isLoading = false;

        this.controllaSeAprireGiocoDaHome();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore nel caricamento dei giochi:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  extractGenres(): void {
    const localGenres = this.games.map(g => g.genere).filter(g => g);
    const rawgGenres = this.rawgSearchResults
      .flatMap(g => g.genres ?? [])
      .map((g: any) => g.name);

    this.availableGenres = [...new Set([...localGenres, ...rawgGenres])].sort();
  }

  filterRawgByGenre(): void {
    if (this.selectedGenre) {
      this.rawgSearchResults = this.rawgSearchResults.filter(g => {
        const genreName = g.genere || (g.genres && g.genres.length ? g.genres[0].name : '');
        return genreName === this.selectedGenre;
      });
    }
  }

  onGenreChange(): void {
    if (this.sourceMode === 'local') {
      this.filterGames();
    } else {
      this.cercaSuRawg();
    }
  }

  cercaSuRawg(): void {
    if (this.searchQuery.trim().length < 3) {
      this.rawgSearchResults = [];
      this.updateDisplayedGames();
      this.cdr.markForCheck();
      return;
    }

    this.gameService.searchGamesOnRawg(this.searchQuery).subscribe({
      next: (response: any) => {
        this.rawgSearchResults = response || [];
        this.extractGenres();
        this.filterRawgByGenre();
        this.updateDisplayedGames();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Errore durante la ricerca globale su RAWG:', err);
        this.cdr.markForCheck();
      }
    });
  }

  setSourceMode(mode: 'local' | 'rawg'): void {
    this.sourceMode = mode;
    this.searchQuery = '';
    this.selectedGenre = '';
    this.rawgSearchResults = [];

    if (mode === 'local') {
      this.filteredGames = this.games;
    }

    this.updateDisplayedGames();
    this.cdr.markForCheck();
  }

  onSearchInput(): void {
    if (this.sourceMode === 'local') {
      this.filterGames();
    } else {
      this.cercaSuRawg();
    }
  }

  filterGames(): void {
    this.filteredGames = this.games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesGenre = this.selectedGenre ? game.genere === this.selectedGenre : true;
      return matchesSearch && matchesGenre;
    });
    this.updateDisplayedGames();
    this.cdr.markForCheck();
  }

  updateDisplayedGames(): void {
    this.giochiDaMostrare = this.sourceMode === 'local' ? this.filteredGames : this.rawgSearchResults;
  }

  importaGiocoInArena(gameFromRawg: any, event: Event): void {
    event.stopPropagation();

    gameFromRawg.isSaving = true;
    this.cdr.markForCheck();

    const nuovoGioco = {
      title: gameFromRawg.title,
      genere: gameFromRawg.genere || (gameFromRawg.genres && gameFromRawg.genres[0]?.name) || 'Generico',
      coverUrl: gameFromRawg.backgroundImage,
      rating: gameFromRawg.rating,
      rawgId: gameFromRawg.slug,
      description: gameFromRawg.description || "Descrizione nel trailer di Gioco"
    };

    this.gameService.saveGame(nuovoGioco).subscribe({
      next: () => {

        gameFromRawg.isSaving = false;
        this.cdr.markForCheck();

        alert(`"${nuovoGioco.title}" salvato con successo nel database di GameHub Arena!`);
        this.gameService.refreshGamesCache();
        this.caricaGiochiLocali();
      },
      error: (err: any) => {

        gameFromRawg.isSaving = false;
        console.error('Errore durante il salvataggio:', err);
        alert('Impossibile salvare il gioco. Forse esiste già?');
        this.cdr.markForCheck();
      }
    });
  }

  apriPopup(game: any): void {
    this.selectedGame = {
      id: game.id,
      title: game.title || game.name || 'Titolo sconosciuto',
      coverUrl: game.coverUrl || game.backgroundImage || 'assets/images/default-cover.png',
      genere: game.genere || (game.genres && game.genres[0]?.name) || 'Generico',
      rating: game.rating || 0,
      rawgId: game.rawgId ? game.rawgId.toString() : (game.slug ? game.slug : ''),
      description: game.description || 'Dettagli disponibili nel trailer ufficiale.'
    };
    this.cdr.markForCheck();
  }

  chiudiPopup(): void {
    this.selectedGame = null;
    this.cdr.markForCheck();
  }

  apriTrailer(game: any): void {
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

  controllaSeAprireGiocoDaHome() {
    this.route.queryParams.subscribe(params => {
      const titoloDaAprire = params['openGame'];

      if (titoloDaAprire) {
        const giocoTrovato = this.games.find(g =>
          g.title.toLowerCase() === titoloDaAprire.toLowerCase()
        );
        if (giocoTrovato) {
          this.apriPopup(giocoTrovato);
        } else {
          console.warn('Gioco non trovato nel database locale:', titoloDaAprire);
        }
      }
    });
  }
}