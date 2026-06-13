import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  selectedGame: any | null = null; // Gestione camaleonte per la modale

  isLoading: boolean = true;

  constructor(
    private gameService: GameService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.caricaGiochiLocali();
  }

  // 1. Carica i giochi locali usando la cache del vostro servizio
  caricaGiochiLocali(): void {
    this.isLoading = true;
    this.cdr.markForCheck(); // Dice ad OnPush di mostrare lo spinner di caricamento

    this.gameService.getCachedGames().subscribe({
      next: (data: Game[]) => {
        this.games = data;
        this.filteredGames = data;
        this.extractGenres();
        this.updateDisplayedGames();
        this.isLoading = false;
        this.cdr.markForCheck(); // 👑 Obbligatorio con OnPush per aggiornare lo schermo
      },
      error: (err) => {
        console.error('Errore nel caricamento dei giochi:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // 2. Estrae la lista dei generi combinando dati locali e dati RAWG
  extractGenres(): void {
    const localGenres = this.games.map(g => g.genere).filter(g => g);
    const rawgGenres = this.rawgSearchResults
      .flatMap(g => g.genres ?? [])
      .map((g: any) => g.name);

    this.availableGenres = [...new Set([...localGenres, ...rawgGenres])].sort();
  }

  // 3. Filtra i risultati RAWG in base al genere selezionato
  filterRawgByGenre(): void {
    if (this.selectedGenre) {
      this.rawgSearchResults = this.rawgSearchResults.filter(g => {
        const genreName = g.genere || (g.genres && g.genres.length ? g.genres[0].name : '');
        return genreName === this.selectedGenre;
      });
    }
  }

  // 4. Gestisce il cambio di valore nel menu a tendina dei generi
  onGenreChange(): void {
    if (this.sourceMode === 'local') {
      this.filterGames();
    } else {
      // Se siamo su RAWG, rieseguiamo prima la ricerca per avere i dati freschi e poi filtriamo
      this.cercaSuRawg();
    }
  }

  // 5. Ricerca globale su RAWG
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
        this.filterRawgByGenre(); // Applica il filtro genere se selezionato
        this.updateDisplayedGames();
        this.cdr.markForCheck(); // 👑 Rende visibili i risultati di RAWG a schermo
      },
      error: (err: any) => {
        console.error('Errore durante la ricerca globale su RAWG:', err);
        this.cdr.markForCheck();
      }
    });
  }

  // 6. Cambia scheda tra locale e globale
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

  // 7. Scatta quando l'utente digita qualcosa nella barra di ricerca
  onSearchInput(): void {
    if (this.sourceMode === 'local') {
      this.filterGames();
    } else {
      this.cercaSuRawg();
    }
  }

  // 8. Filtra i giochi del database locale
  filterGames(): void {
    this.filteredGames = this.games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesGenre = this.selectedGenre ? game.genere === this.selectedGenre : true;
      return matchesSearch && matchesGenre;
    });
    this.updateDisplayedGames();
    this.cdr.markForCheck();
  }

  // 9. Aggiorna l'array unico puntato dal ciclo @for nell'HTML
  updateDisplayedGames(): void {
    this.giochiDaMostrare = this.sourceMode === 'local' ? this.filteredGames : this.rawgSearchResults;
  }

  // 10. Salva un gioco sul database di Spring Boot
  importaGiocoInArena(gameFromRawg: any, event: Event): void {
    event.stopPropagation();

    const nuovoGioco = {
      title: gameFromRawg.title,
      genere: gameFromRawg.genere || (gameFromRawg.genres && gameFromRawg.genres[0]?.name) || 'Generico',
      coverUrl: gameFromRawg.backgroundImage,
      rating: gameFromRawg.rating,
      rawgId: gameFromRawg.slug
    };

    this.gameService.saveGame(nuovoGioco).subscribe({
      next: () => {
        alert(`"${nuovoGioco.title}" salvato con successo nel database di GameHub Arena!`);
        this.gameService.refreshGamesCache(); // Invalida la vecchia cache per fare ordine
        this.caricaGiochiLocali();            // Ricarica la lista aggiornata
      },
      error: (err: any) => {
        console.error('Errore durante il salvataggio:', err);
        alert('Impossibile salvare il gioco. Forse esiste già?');
        this.cdr.markForCheck();
      }
    });
  }

  // 11. Gestione Popup Dettagli
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

  // 12. Gestione Trailer
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
}