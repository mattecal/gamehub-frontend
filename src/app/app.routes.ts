import { Routes } from '@angular/router';
import { TournamentsComponent } from './pages/tournaments/tournaments';
import { TournamentDetailComponent } from './pages/tournament-detail/tournament-detail';
import { HomeComponent } from './pages/home/home.component';
import { GamesComponent } from './pages/games/game';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { AdminPannelComponent } from './pages/admin-pannel/admin-pannel';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'tornei', component: TournamentsComponent },
  { path: 'tornei/:id', component: TournamentDetailComponent },
  {path: 'admin',component:AdminPannelComponent},
  { path: 'giochi', component: GamesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrati', component: RegisterComponent },
  { path: 'tornei-details', component: TournamentDetailComponent},
  { path: 'player', component: ProfileComponent },
  { path: 'organizer', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];

/**
 * Required for Angular prerendering of parameterized routes.
 * Returns an empty params object as the route does not need specific data for prerendering.
 */
export function getPrerenderParams(params: any) {
  return {};
}

