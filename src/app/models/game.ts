export interface Game {
  id: number;
  title: string;
  coverUrl: string;
  genere: string;
  rating: number;
  trailerUrl?: string;
  rawgId?: string;
}