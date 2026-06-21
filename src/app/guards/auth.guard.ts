import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// TIPS: I Guard in Angular proteggono le rotte. Il CanActivateFn viene eseguito prima che l'utente acceda a una pagina.
// Se restituisce 'true', l'utente entra. Se 'false', viene bloccato (e in questo caso rimandato al login).
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
