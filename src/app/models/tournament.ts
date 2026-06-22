import { Game } from './game';

export interface Tournament {
date: any;
  id: number;
  startDate: string;
  title: string;
  description?: string;
  status?: string;
  participantsCount?: number;
  players?: { id: number; username: string }[];
  teams: Team[];
  game: Game;
  gameImageUrl?: string;
  registrationOpen?:boolean;
  rating?:number;
}

export interface Team{
  id: number;
  name: string;
  score: number;
}