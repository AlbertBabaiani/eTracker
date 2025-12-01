import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const confirmPasswordValidator: ValidatorFn = (
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
