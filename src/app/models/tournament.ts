import { Game } from './game';

export interface Tournament {
  id: number;
  title: string;
  description?: string;
  date: string;
  status?: string;
  participantsCount?: number;
  players?: { id: number; username: string }[];
  game: Game;
}