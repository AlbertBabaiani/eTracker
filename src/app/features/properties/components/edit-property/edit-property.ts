import { Component, effect, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../../core/services/property-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Property } from '../../../../shared/models/Property';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { IUser } from '../../../../shared/models/IUser';

@Component({
  selector: 'app-edit-property',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatChipsModule,
  ],
  templateUrl: './edit-property.html',
  styleUrl: './edit-property.scss',
})
export class EditProperty {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private snackBar = inject(MatSnackBar);

  private routeParams = toSignal(this.route.paramMap);

  propertyId: string | null = null;
  propertyForm: FormGroup | null = null;
  isEditMode = signal(false);

  // Sharing State
  showOwnerInput = signal(false);
  currentOwnerIds = signal<string[]>([]);
  searchUserControl = new FormControl('');
  filteredUsers = signal<IUser[]>([]);

  private originalProperty: Property | undefined;

  constructor() {
    effect(() => {
      const params = this.routeParams();
      const id = params?.get('id');

      if (id) {
        this.propertyId = id;
        this.isEditMode.set(true);
        const property = this.propertyService.getPropertyById(id);

        if (property) {
          this.originalProperty = property;
          this.currentOwnerIds.set(property.ownerIds || []);
          this.initForm(property);
        } else {
          this.cancel();
        }
      } else {
        this.propertyId = null;
        this.isEditMode.set(false);
        this.originalProperty = undefined;
        this.currentOwnerIds.set([]);
        this.initForm();
      }
    });

    // Setup Search Logic
    this.searchUserControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          if (typeof value === 'string' && value.length > 1) {
            return this.propertyService.searchUsers(value);
          }
          return [];
        })
      )
      .subscribe((users) => {
        this.filteredUsers.set(users);
      });
  }

  initForm(property?: Property) {
    this.propertyForm = this.fb.group({
      id: [property?.id || ''],
      name: [property?.name || '', Validators.required],
      alias: [property?.alias || ''],
      location: [property?.location || '', Validators.required],
      googleMapsAddress: [property?.googleMapsAddress || ''],
      rooms: [property?.rooms || 0, [Validators.required, Validators.min(0)]],
      maxGuests: [property?.maxGuests || 1, [Validators.required, Validators.min(1)]],
      floor: [property?.floor || 0, Validators.required],
      blockName: [property?.blockName || ''],
      facebook: [property?.socialMedia?.facebook || ''],
      instagram: [property?.socialMedia?.instagram || ''],
    });
  }

  addOwner(user: IUser) {
    if (user && user.uid) {
      // Add to local state (to be saved on submit)
      this.currentOwnerIds.update((ids: any) => {
        if (!ids.includes(user.uid!)) {
          return [...ids, user.uid];
        }
        return ids;
      });

      // Reset search
      this.searchUserControl.setValue('');
      this.showOwnerInput.set(false);
      this.propertyForm?.markAsDirty(); // Mark form dirty so "Save" is valid/warns on exit
      this.snackBar.open(`Added ${user.displayName} to pending owners. Click Save.`, 'OK', {
        duration: 3000,
      });
    }
  }

  onSubmit() {
    if (this.propertyForm?.valid) {
      const formValue = this.propertyForm.value;

      const mergedProperty: Property = {
        ...(this.originalProperty || { ownerIds: [] }),
        ...formValue,

        // Use the updated owner list from our signal
        ownerIds: this.currentOwnerIds(),

        rooms: Number(formValue.rooms),
        maxGuests: Number(formValue.maxGuests),
        floor: Number(formValue.floor),

        socialMedia:
          formValue.facebook || formValue.instagram
            ? {
                facebook: formValue.facebook || undefined,
                instagram: formValue.instagram || undefined,
              }
            : undefined,
      } as Property;

      if (!mergedProperty.id && this.propertyId) {
        mergedProperty.id = this.propertyId;
      }

      if (this.isEditMode()) {
        this.propertyService.updateProperty(mergedProperty);
        this.snackBar.open('Property updated successfully!', 'Close', { duration: 3000 });
      } else {
        this.propertyService.addProperty(mergedProperty);
        this.snackBar.open('Property added successfully!', 'Close', { duration: 3000 });
      }

      this.propertyForm.markAsPristine();
      this.location.back();
    }
  }

  cancel() {
    this.location.back();
  }

  canDeactivate(): boolean {
    if (this.propertyForm?.dirty) {
      return window.confirm('You have unsaved changes. Discard and leave?');
    }
    return true;
  }
}
