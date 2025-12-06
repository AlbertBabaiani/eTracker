import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static confirmPasswordValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    if (!control.parent) {
      return null;
    }

    const password = control.parent.get('password');
    const repeatPassword = control;

    if (!password || !repeatPassword) {
      return null;
    }

    if (repeatPassword.value && password.value !== repeatPassword.value) {
      return { mismatch: true };
    }

    return null;
  };

  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').toString().trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  static maxWords(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null; // Let 'required' handle empty values

      const value = control.value.toString().trim();

      // Split by one or more whitespace characters
      const words = value.split(/\s+/).filter((w: string) => w.length > 0);

      if (words.length > max) {
        return {
          maxWords: {
            required: max,
            actual: words.length,
          },
        };
      }
      return null;
    };
  }
}
