import { Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-edit-profile',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss',
})
export class EditProfile {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  currentUser = this.authService.currentUser;

  profileForm = this.fb.group({
    displayName: ['', Validators.required],
    photoURL: [''],
    phoneNumber: [''],
  });

  constructor() {
    // Populate form when user data loads
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.profileForm.patchValue({
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
        });
      }
    });
  }

  async onSubmit() {
    if (this.profileForm.valid) {
      try {
        // await this.authService.updateProfile(this.profileForm.value);
        this.snackBar.open('Profile updated!', 'Close', { duration: 3000 });
        this.router.navigate(['/profile']);
      } catch (err) {
        this.snackBar.open('Update failed.', 'Close', { duration: 3000 });
      }
    }
  }
}
