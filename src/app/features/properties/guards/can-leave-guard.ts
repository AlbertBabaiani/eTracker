import { CanDeactivateFn } from '@angular/router';
import { EditProperty } from '../components/edit-property/edit-property';

export const canLeaveGuard: CanDeactivateFn<EditProperty> = (component) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};
