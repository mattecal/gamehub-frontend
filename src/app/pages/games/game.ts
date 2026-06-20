import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GameService } from '../../services/games.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from '../../models/game';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { LibraryService } from '../../services/library.service';



@Component({
  selector: 'app-games',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './games.html',
  styleUrls: ['./games.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamesComponent implements OnInit {

  games: any[] = [];
  filteredGames: any[] = [];
  rawgSearchResults: any[] = [];
  giochiDaMostrare: any[] = [];

  searchQuery: string = '';
  selectedGenre: string = '';
  availableGenres: string[] = [];

  sourceMode: 'local' | 'rawg' = 'local';
  selectedGame: any | null = null;

  myLibraryGames: any[] = [];
  myLibraryIds: Set<number> = new Set<number>();

  isLoading: boolean = true;
  canImport: boolean = false;


  constructor(
    private gameService: GameService,
    public authService: AuthService,
    private libraryService: LibraryService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.canImport = role === 'ROLE_ADMIN' || role === 'ADMIN'
    this.caricaGiochiLocali();
    this.caricaMiaLibreria();
  }

  caricaGiochiLocali(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.gameService.getCachedGames().subscribe({
      next: (data: Game[]) => {
        this.games = data;
        this.extractGenres();
        this.dispatchFiltering();
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

  caricaMiaLibreria(): void {
    this.libraryService.getMyLibrary().subscribe({
      next: (data: Game[]) => {
        this.myLibraryGames = data;
        this.myLibraryIds = new Set(data.map(g => g.id));
        this.dispatchFiltering();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore caricamento libreria', err);
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
    this.dispatchFiltering();
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
    this.dispatchFiltering();
  }

  onSearchInput(): void {
    this.dispatchFiltering();
  }

  private dispatchFiltering(): void {
    let baseArray: any[] = [];

    if (this.sourceMode === 'local') {
      baseArray = this.canImport ? this.games : this.myLibraryGames;
    } else {
      if (this.canImport) {
        this.cercaSuRawg();
        return;
      } else {
        baseArray = this.games;
      }
    }

    this.filteredGames = baseArray.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesGenre = this.selectedGenre ? game.genere === this.selectedGenre : true;
      return matchesSearch && matchesGenre;
    });

    this.updateDisplayedGames();
    this.cdr.markForCheck();
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
    if (this.sourceMode === 'local') {
      this.giochiDaMostrare = this.filteredGames;
    } else {
      this.giochiDaMostrare = this.canImport ? this.rawgSearchResults : this.filteredGames;
    }
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
      description: gameFromRawg.description || "Dettagli disponibili nel trailer ufficiale."
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

  isInLibrary(game: any): boolean {
    return this.myLibraryIds.has(game.id);
  }

  aggiungiALibreria(game: any, event: Event): void {
    event.stopPropagation();

    this.libraryService.addGame(game.id).subscribe({
      next: () => {
        this.myLibraryIds.add(game.id);
        this.myLibraryGames.push(game);
        this.dispatchFiltering();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore aggiunta alla libreria:', err);
        alert('Impossibile aggiungere il gioco alla libreria.');
      }
    });
  }

  rimuoviDaLibreria(game: any, event: Event): void {
    event.stopPropagation();
    this.libraryService.removeGame(game.id).subscribe({
      next: () => {
        this.myLibraryIds.delete(game.id);
        this.myLibraryGames = this.myLibraryGames.filter(g => g.id !== game.id);
        this.dispatchFiltering();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore rimozione dalla libreria:', err);
        alert('Impossibile rimuovere il gioco dalla libreria.');
      }
    });
  }
}