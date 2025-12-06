import { Component, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoDirective } from '@jsverse/transloco';
import { UserAccountFormFields } from '../../models/IUser';

@Component({
  selector: 'app-user-account-fields',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    TranslocoDirective,
  ],
  templateUrl: './user-account-fields.html',
  styleUrl: './user-account-fields.scss',
})
export class UserAccountFields {
  group = input.required<FormGroup<UserAccountFormFields>>();
  showConfirmPassword = input<boolean>(false);

  // Local state for visibility toggle
  hidePassword = signal<boolean>(true);
}
