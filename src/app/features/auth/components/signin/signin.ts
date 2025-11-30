import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Logo } from '../../../../shared/components/logo/logo';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-signin',
  imports: [
    LanguageSwitcher,
    Logo,
    ReactiveFormsModule,
    RouterLink,
    TranslocoDirective,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  templateUrl: './signin.html',
  styleUrl: './signin.scss',
})
export class Signin {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);

  form = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.minLength(4), Validators.maxLength(50)],
    ],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
  });

  async onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;

      const closeLabel = this.transloco.translate('AUTH.TOAST.CLOSE');

      try {
        await this.authService.signin(email!, password!);

        const successMsg = this.transloco.translate('AUTH.TOAST.SUCCESS');

        this.snackBar.open(successMsg, closeLabel, {
          duration: 3000,
          panelClass: ['success-toast'],
        });

        this.router.navigate(['/dashboard']);
      } catch (err) {
        const errorMsg = this.transloco.translate('AUTH.TOAST.FAILURE');
        this.form.reset();

        this.snackBar.open(errorMsg, closeLabel, {
          duration: 3000,
          panelClass: ['error-toast'],
        });
      }
    }
  }
}
