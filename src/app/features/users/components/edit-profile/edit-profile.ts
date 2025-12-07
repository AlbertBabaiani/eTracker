import { Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';
import { PropertyService } from '../../../../core/services/property-service';
import { TranslocoDirective } from '@jsverse/transloco';
import { UserPersonalForm } from '../../../../shared/components/user-personal-form/user-personal-fields';
import { CustomValidators } from '../../../../shared/validators/passowrdMatchValidator';
import { TitleCasePipe } from '@angular/common';
import { TruncatePipe } from '../../../../shared/pipes/truncate-pipe';

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
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    TranslocoDirective,
    UserPersonalForm,
    TruncatePipe,
    TitleCasePipe,
  ],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss',
})
export class EditProfile {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  currentUser = this.authService.currentUser;
  userProperties = this.propertyService.properties;

  form = this.fb.group({
    firstName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        CustomValidators.noWhitespace,
        CustomValidators.maxWords(2),
      ],
    ],
    lastName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        CustomValidators.noWhitespace,
        CustomValidators.maxWords(1),
      ],
    ],
    phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    displayName: [
      '',
      [
        Validators.minLength(2),
        Validators.maxLength(100),
        CustomValidators.noWhitespace,
        CustomValidators.maxWords(2),
      ],
    ],
  });

  constructor() {
    effect(() => {
      const user = this.currentUser();
      console.log(user);
      if (user) {
        this.form.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          displayName: user.displayName || '',
          phone: user.phone,
        });
      }
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      try {
        await this.authService.updateProfile(this.form.value);
        this.snackBar.open('Profile updated!', 'Close', { duration: 3000 });
        this.router.navigate(['/profile']);
      } catch (err) {
        this.snackBar.open('Update failed.', 'Close', { duration: 3000 });
      }
    }
  }

  async deleteProperty(propertyId: string | undefined, event: Event) {
    event.stopPropagation(); // Prevent chip click if we add navigation later
    if (!propertyId) return;

    if (confirm('Are you sure you want to delete this property?')) {
      try {
        // await this.propertyService.deleteProperty(propertyId);
        this.snackBar.open('Property deleted.', 'Close', { duration: 3000 });
      } catch (err) {
        this.snackBar.open('Failed to delete property.', 'Close', { duration: 3000 });
      }
    }
  }
}
