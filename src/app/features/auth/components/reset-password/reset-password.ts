import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../../core/services/auth-service';
import { RouterLink } from '@angular/router';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';
import { Logo } from '../../../../shared/components/logo/logo';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-reset-password',
  imports: [
    LanguageSwitcher,
    Logo,
    TranslocoDirective,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private authService = inject(AuthService);

  email = signal<string>('');

  async onSubmit() {
    if (this.email) {
      try {
        await this.authService.resetPassword(this.email());
      } catch (err) {
        this.email.set('');
      }
    }
  }
}
