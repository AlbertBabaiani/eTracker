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

  showSuccess(messageKey: string, params?: any) {
    this.show(messageKey, 'success-snackbar', params, 'AUTH.TOAST.SUCCESS');
  }

  showError(messageKey: string, params?: any) {
    this.show(messageKey, 'error-snackbar', params, 'AUTH.TOAST.ERROR');
  }

  private show(messageKey: string, panelClass: string, params: any = {}, actionLabelKey: string) {
    const message = this.transloco.translate(messageKey, params);
    const action = this.transloco.translate('AUTH.TOAST.CLOSE');

    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: [panelClass],
    });
  }

  handleAuthError(error: any) {
    let key = 'AUTH.TOAST.GENERIC_ERROR';

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          key = 'AUTH.TOAST.EMAIL_IN_USE';
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          key = 'AUTH.TOAST.INVALID_CREDENTIALS';
          break;
      }
    } else if (error.message === 'auth/email-not-verified') {
      key = 'AUTH.TOAST.EMAIL_NOT_VERIFIED';
    }

    this.showError(key);
  }
}
