import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth-service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  signupForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: [
      '',
      [Validators.required, Validators.email, Validators.minLength(4), Validators.maxLength(50)],
    ],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
  });

  async onSubmit() {
    if (this.signupForm.valid) {
      const { email, password, displayName } = this.signupForm.value;
      try {
        await this.authService.signUp(email!, password!, displayName!);
        this.snackBar.open('Account created!', 'Close', { duration: 3000 });
        this.router.navigate(['/']);
      } catch (err) {
        this.snackBar.open('Signup failed. Try again.', 'Close', { duration: 3000 });
      }
    }
  }
}
