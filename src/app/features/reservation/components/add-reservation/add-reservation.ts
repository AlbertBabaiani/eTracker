import { Component, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { PropertyService } from '../../../../core/services/property-service';
import { GuestService } from '../../../../core/services/guest-service';
import { Guest } from '../../models/Guest';

@Component({
  selector: 'app-add-reservation',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
  templateUrl: './add-reservation.html',
  styleUrl: './add-reservation.scss',
})
export class AddReservation {
  private fb = inject(NonNullableFormBuilder);
  private propertyService = inject(PropertyService);
  private guestService = inject(GuestService);
  private dialogRef = inject(MatDialogRef<AddReservation>);

  properties = this.propertyService.properties;
  filteredGuests = signal<Guest[]>([]);

  isNewGuest = signal(false);

  readonly DEFAULT_CHECKIN = '14:00';
  readonly DEFAULT_CHECKOUT = '11:00';

  form = this.fb.group({
    propertyId: ['', Validators.required],
    propertyName: ['', Validators.required],

    // Date & Time
    startDate: [new Date(), Validators.required],
    startTime: [this.DEFAULT_CHECKIN, Validators.required],
    endDate: [new Date(new Date().setDate(new Date().getDate() + 1)), Validators.required],
    endTime: [this.DEFAULT_CHECKOUT, Validators.required],

    // Financials
    price: [0, [Validators.required, Validators.min(0)]],
    bePrice: [0, Validators.min(0)],

    // Guest - Existing
    guestSearch: [''],
    selectedGuestId: [''],

    // Guest - New
    guestFirstName: [''],
    guestLastName: [''],
    guestPhone: [''],
  });

  constructor() {
    // Setup Autocomplete Logic
    this.form
      .get('guestSearch')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term && typeof term === 'string' && term.length > 1) {
            return this.guestService.searchGuests(term);
          }
          return of([]);
        })
      )
      .subscribe((guests) => {
        this.filteredGuests.set(guests);
      });

    // Toggle validation based on "New Guest" switch
    effect(() => {
      const isNew = this.isNewGuest();
      const fName = this.form.get('guestFirstName');
      const lName = this.form.get('guestLastName');
      const search = this.form.get('guestSearch');
      const selId = this.form.get('selectedGuestId');

      if (isNew) {
        fName?.setValidators([Validators.required]);
        lName?.setValidators([Validators.required]);
        search?.clearValidators();
        selId?.clearValidators();
      } else {
        fName?.clearValidators();
        lName?.clearValidators();
        search?.setValidators([Validators.required]);
        // We essentially need an ID if we aren't creating a new one
        // but 'guestSearch' validator handles the UI require
      }

      fName?.updateValueAndValidity();
      lName?.updateValueAndValidity();
      search?.updateValueAndValidity();
    });
  }

  displayGuestFn(guest: Guest): string {
    return guest ? `${guest.firstName} ${guest.lastName}` : '';
  }

  selectGuest(guest: Guest) {
    this.form.patchValue({ selectedGuestId: guest.id });
  }

  async onSubmit() {
    this.guestService.addGuest({ firstName: 'sffds', lastName: 'asddfsa' });
    // if (this.form.invalid) return;
    // const val = this.form.value;
    // let finalGuestId = val.selectedGuestId;
    // try {
    //   // 1. Create Guest if New
    //   if (this.isNewGuest()) {
    //     const newGuest = {
    //       firstName: val.guestFirstName!,
    //       lastName: val.guestLastName!,
    //       phone: val.guestPhone || '',
    //       notes: '',
    //     };
    //     finalGuestId = await this.guestService.addGuest(newGuest);
    //   }
    //   if (!finalGuestId) throw new Error('Guest ID missing');
    //   // 2. Combine Dates and Times
    //   const startDateTime = this.combineDateTime(val.startDate!, val.startTime!);
    //   const endDateTime = this.combineDateTime(val.endDate!, val.endTime!);
    //   this.dialogRef.close(true);
    // } catch (error) {
    //   console.error(error);
    //   // Handle error (show snackbar)
    // }
  }

  private combineDateTime(date: Date, timeStr: string): Date {
    const d = new Date(date);
    const [hours, minutes] = timeStr.split(':').map(Number);
    d.setHours(hours);
    d.setMinutes(minutes);
    d.setSeconds(0);
    return d;
  }
}
