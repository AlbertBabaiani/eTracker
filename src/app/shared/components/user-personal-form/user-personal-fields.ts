import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoDirective } from '@jsverse/transloco';
import { UserPersonalFormFields } from '../../models/IUser';

@Component({
  selector: 'app-user-personal-form',
  imports: [ReactiveFormsModule, TranslocoDirective, MatInputModule, MatFormFieldModule],
  templateUrl: './user-personal-fields.html',
  styleUrl: './user-personal-fields.scss',
})
export class UserPersonalForm {
  group = input.required<FormGroup<UserPersonalFormFields>>();
}
