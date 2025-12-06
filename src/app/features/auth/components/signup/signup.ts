import { Component, inject, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth-service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';
import { Logo } from '../../../../shared/components/logo/logo';
import { TranslocoDirective } from '@jsverse/transloco';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import {
  signUpFormData,
  UserAccountFormFields,
  UserPersonalFormFields,
} from '../../../../shared/models/IUser';
import { UserPersonalForm } from '../../../../shared/components/user-personal-form/user-personal-fields';
import { CustomValidators } from '../../../../shared/validators/passowrdMatchValidator';
import { UserAccountFields } from '../../../../shared/components/user-account-fields/user-account-fields';

@Component({
  selector: 'app-signup',
  imports: [
    LanguageSwitcher,
    Logo,
    UserPersonalForm,
    TranslocoDirective,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatStepperModule,
    MatCheckboxModule,
    UserAccountFields,
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);

  // Signals to manage the success state after submission
  emailSent = signal<boolean>(false);
  sentEmailAddress = signal<string>('');

  // Root form group containing steps
  form = this.fb.group({
    // Step 1: Personal Info
    personal: this.fb.group({
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
      displayName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          CustomValidators.noWhitespace,
          CustomValidators.maxWords(2),
        ],
      ],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    }),

    // Step 2: Account Info
    account: this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50),
          // Regex: At least one Uppercase, one Number, one Special Char
          Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/),
        ],
      ],
      repeatPassword: ['', [Validators.required, CustomValidators.confirmPasswordValidator]],
    }),
  });

  // Helper getters for template access
  get personalGroup() {
    return this.form.get('personal') as FormGroup<UserPersonalFormFields>;
  }
  get accountGroup() {
    return this.form.get('account') as FormGroup<UserAccountFormFields>;
  }

  constructor() {
    const accountGroup = this.form.controls.account;
    const passwordControl = accountGroup.controls.password;
    const repeatPasswordControl = accountGroup.controls.repeatPassword;

    // Re-validate repeatPassword whenever the main password changes
    passwordControl.valueChanges.subscribe(() => {
      repeatPasswordControl.updateValueAndValidity();
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      const formData = this.form.getRawValue();
      console.log();

      const personal = formData.personal;
      const account = formData.account;

      const displayName = `${personal.firstName.trim()} ${personal.lastName.trim()}`;

      const email = account.email.trim();
      const password = account.password.trim();
      const firstName = personal.firstName.trim();
      const lastName = personal.lastName.trim();

      const form: signUpFormData = {
        email,
        password,
        firstName,
        lastName,
        displayName,
        phone: personal.phone,
      };

      try {
        await this.authService.signup(form);

        this.sentEmailAddress.set(account.email);
        this.emailSent.set(true);
      } catch (err) {
        this.sentEmailAddress.set('');
        this.emailSent.set(false);
      }
    }
  }
}
