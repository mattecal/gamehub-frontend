import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// TIPS: Gli Interceptor in Angular agiscono come un "middleware" lato client.
// Questo intercetta OGNI richiesta HTTP in uscita, preleva il Token JWT dal localStorage e lo "inietta"
// nell'header 'Authorization'. È il modo standard per gestire l'autenticazione col backend.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
