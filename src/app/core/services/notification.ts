import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class Notification {
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);

  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  };

  private defaultErrorMessage = 'TOAST.GENERIC_ERROR';

  showSuccess(messageKey: string = this.defaultErrorMessage, params?: any) {
    this.show(messageKey, 'success-snackbar', params);
  }

  showError(messageKey: string = this.defaultErrorMessage, params?: any) {
    this.show(messageKey, 'error-snackbar', params);
  }

  private show(messageKey: string, typeOfNotification: string, params?: any) {
    const message = this.transloco.translate(messageKey, params);
    const action = this.transloco.translate('TOAST.CLOSE');

    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: [typeOfNotification],
    });
  }

  handleAuthError(code: string) {
    let key = 'TOAST.GENERIC_ERROR';

    switch (code) {
      case 'auth/email-already-in-use':
        key = 'AUTH.TOAST.EMAIL_IN_USE';
        break;
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        key = 'AUTH.TOAST.INVALID_CREDENTIALS';
        break;
      case 'auth/email-not-verified':
        key = 'AUTH.TOAST.EMAIL_NOT_VERIFIED';
        break;
      case 'auth/invalid-email':
        key = 'AUTH.TOAST.INVALID_EMAIL';
        break;
    }

    this.showError(key);
  }
}
