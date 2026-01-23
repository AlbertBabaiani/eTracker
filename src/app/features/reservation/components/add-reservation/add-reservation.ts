import { Component, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { debounceTime, distinctUntilChanged, merge, startWith } from 'rxjs';
import { Guest } from '../../models/Guest';
import { TruncatePipe } from '../../../../shared/pipes/truncate-pipe';
import { AddReservationService } from '../../services/add-reservation-service';
import { CustomValidators } from '../../../../shared/validators/passowrdMatchValidator';
import { TranslocoDirective } from '@jsverse/transloco';
import { Reservation } from '../../models/Reservation';

@Component({
  selector: 'app-add-reservation',
  imports: [
    TruncatePipe,
    TranslocoDirective,
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
  providers: [provideNativeDateAdapter()],
  templateUrl: './add-reservation.html',
  styleUrl: './add-reservation.scss',
})
export class AddReservation {
  private fb = inject(NonNullableFormBuilder);
  private service = inject(AddReservationService);
  private dialogRef = inject(MatDialogRef<AddReservation>);

  properties = this.service.properties;
  filteredGuests = signal<Guest[]>(this.service.guests());

  isNewGuest = signal<boolean>(false);

  days = signal<number>(0);

  readonly DEFAULT_CHECKIN = '14:00';
  readonly DEFAULT_CHECKOUT = '11:00';

  form = this.fb.group({
    propertyId: ['', Validators.required],

    // Date & Time
    startDate: [new Date(), Validators.required],
    startTime: [this.DEFAULT_CHECKIN, Validators.required],
    endDate: [new Date(new Date().setDate(new Date().getDate() + 1)), [Validators.required]],
    endTime: [this.DEFAULT_CHECKOUT, Validators.required],

    // Financials
    dayPrice: [50, [Validators.required, Validators.min(50), Validators.max(1000)]],
    totalPrice: [50, [Validators.required, Validators.min(50), Validators.max(100000)]],
    bePrice: [0, [Validators.min(0), Validators.max(10000)]],

    // Guest - Existing
    guestSearch: [''],
    selectedGuestId: [''],

    // Guest - New
    guestFirstName: [''],
    guestLastName: [''],
    guestPhone: [''],
  });

  constructor() {
    this.form
      .get('guestSearch')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.filteredGuests.set(this.service.guests());

        if (term && typeof term === 'string' && term.length > 1) {
          const searched_guest = this.service.searchGuests(term);
          this.filteredGuests.set(searched_guest);
        }
      });

    merge(
      this.form.get('startDate')!.valueChanges,
      this.form.get('startTime')!.valueChanges,
      this.form.get('endDate')!.valueChanges,
      this.form.get('endTime')!.valueChanges
    )
      .pipe(startWith(null))
      .subscribe(() => {
        this.recalculateDays();
        this.recalculateTotalPrice();
      });

    this.form
      .get('dayPrice')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => {
        this.recalculateTotalPrice();
      });

    this.form
      .get('totalPrice')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe(() => {
        this.recalculateDayPrice();
      });

    effect(() => {
      const isNew = this.isNewGuest();
      const fName = this.form.get('guestFirstName');
      const lName = this.form.get('guestLastName');
      const phone = this.form.get('guestPhone');
      const search = this.form.get('guestSearch');
      const selId = this.form.get('selectedGuestId');

      if (isNew) {
        search?.setValue('');
        selId?.setValue('');

        fName?.setValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.noWhitespace,
          CustomValidators.maxWords(2),
        ]);

        lName?.setValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          CustomValidators.noWhitespace,
          CustomValidators.maxWords(1),
        ]);
        phone?.setValidators([Validators.required, Validators.pattern(/^\d{9}$/)]);
        search?.clearValidators();
        selId?.clearValidators();
      } else {
        fName?.setValue('');
        lName?.setValue('');
        phone?.setValue('');
        fName?.clearValidators();
        lName?.clearValidators();
        phone?.clearValidators();
        search?.setValidators([Validators.required]);
        selId?.setValidators([Validators.required]);
      }

      fName?.updateValueAndValidity();
      lName?.updateValueAndValidity();
      phone?.updateValueAndValidity();
      search?.updateValueAndValidity();
      selId?.updateValueAndValidity();
    });
  }

  displayGuestFn(guest: Guest): string {
    return guest ? `${guest.firstName} ${guest.lastName}` : '';
  }

  selectGuest(guest: Guest) {
    this.form.patchValue({ selectedGuestId: guest.id });
  }

  async onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const val = this.form.value;

    const startDateTime = this.combineDateTime(val.startDate!, val.startTime!);
    const endDateTime = this.combineDateTime(val.endDate!, val.endTime!);

    try {
      if (this.isNewGuest()) {
        const final_reservation: Omit<Reservation, 'guestId'> = {
          propertyId: val.propertyId!,
          startDate: startDateTime,
          endDate: endDateTime,
          days: this.days(),
          dayPrice: val.dayPrice!,
          totalPrice: val.totalPrice!,
          bePrice: val.bePrice!,
        };

        const guest: Guest = {
          firstName: this.form.get('guestFirstName')!.value,
          lastName: this.form.get('guestLastName')!.value,
          phone: this.form.get('guestPhone')!.value,
        };

        this.service.addGuestAndReservation(final_reservation, guest);
      } else {
        const final_reservation: Reservation = {
          propertyId: val.propertyId!,
          guestId: val.selectedGuestId!,
          startDate: startDateTime,
          endDate: endDateTime,
          days: this.days(),
          dayPrice: val.dayPrice!,
          totalPrice: val.totalPrice!,
          bePrice: val.bePrice!,
        };

        this.service.addOnlyReservation(final_reservation);
      }

      this.dialogRef.close(true);
    } catch (err) {}

    // if (this.isNewGuest()) {

    //   console.log(startDateTime, endDateTime);
    //   console.log(days);
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

  private calculateDays(start: Date, end: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));
    return diffDays || 1;
  }

  recalculateDays() {
    const sDate = this.form.get('startDate')?.value;
    const sTime = this.form.get('startTime')?.value;
    const eDate = this.form.get('endDate')?.value;
    const eTime = this.form.get('endTime')?.value;

    if (sDate && sTime && eDate && eTime) {
      const start = this.combineDateTime(sDate, sTime);
      const end = this.combineDateTime(eDate, eTime);

      this.days.set(this.calculateDays(start, end));
    }
  }

  recalculateTotalPrice() {
    const dPrice = this.form.get('dayPrice')?.value;

    this.form.patchValue(
      {
        totalPrice: (dPrice || 50) * this.days(),
      },
      { emitEvent: false }
    );
  }

  recalculateDayPrice() {
    const tPrice = this.form.get('totalPrice')?.value;

    this.form.patchValue(
      {
        dayPrice: Number(((tPrice || 50) / this.days()).toFixed(2)),
      },
      { emitEvent: false }
    );
  }
}
