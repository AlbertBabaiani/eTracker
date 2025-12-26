import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const wildcardGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.authUser$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return router.createUrlTree(['/feature/calendar']);
      }

      return router.createUrlTree(['/auth']);
    })
  );
};
