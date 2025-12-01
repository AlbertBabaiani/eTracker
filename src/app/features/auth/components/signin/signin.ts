import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../../core/services/auth-service';
import { MatIconModule } from '@angular/material/icon';
import { Logo } from '../../../../shared/components/logo/logo';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';
import { TranslocoDirective } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signin',
  imports: [
    LanguageSwitcher,
    Logo,
    ReactiveFormsModule,
    TranslocoDirective,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
  ],
  templateUrl: './signin.html',
  styleUrl: './signin.scss',
})
export class Signin {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);

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

      try {
        await this.authService.signin(email!, password!);
      } catch (err) {
        this.form.reset();
      }
    }
  }
}
