import { inject, Injectable, signal } from '@angular/core';
import { Reservation } from '../models/Reservation';
import { addDoc, collection, Firestore, Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private firestore = inject(Firestore);

  private _reservations = signal<Reservation[]>([
    {
      id: 'res_1',
      propertyId: 'prop_flat_1',
      guestId: 'John Doe',
      // Check-in: 5th at 14:00 (2 PM)
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5, 14, 0),
      // Check-out: 8th at 11:00 (11 AM)
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 8, 11, 0),
      dayPrice: 300,
      totalPrice: 900,
      days: 3,
    },
    {
      id: 'res_2',
      propertyId: 'prop_flat_1',
      guestId: 'Jane Smith',
      // Check-in: 8th at 15:00 (3 PM) - TURNOVER DAY
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 8, 15, 0),
      // Check-out: 12th at 10:00 (10 AM)
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 10, 0),
      dayPrice: 600,
      totalPrice: 2400,
      days: 4,
    },
    {
      id: 'res_3',
      propertyId: 'prop_flat_2',
      guestId: 'Jane Smith',
      // Check-in: 8th at 15:00 (3 PM) - TURNOVER DAY
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 8, 15, 0),
      // Check-out: 12th at 10:00 (10 AM)
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 10, 0),
      dayPrice: 1000,
      totalPrice: 10000,
      days: 10,
    },
  ]);

  readonly reservations = this._reservations.asReadonly();

  getReservationsForDate(date: Date): Reservation[] {
    const checkStart = new Date(date);
    checkStart.setHours(0, 0, 0, 0);

    const checkEnd = new Date(date);
    checkEnd.setHours(23, 59, 59, 999);

    return this._reservations().filter((res) => {
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);

      return resStart < checkEnd && resEnd > checkStart;
    });
  }

  getReservationType(date: Date, res: Reservation): 'start' | 'end' | 'stay' | 'single-day' {
    const d = new Date(date).setHours(0, 0, 0, 0);
    const start = new Date(res.startDate).setHours(0, 0, 0, 0);
    const end = new Date(res.endDate).setHours(0, 0, 0, 0);

    if (start === end) return 'single-day';
    if (d === start) return 'start';
    if (d === end) return 'end';
    return 'stay';
  }

  async addReservation(reservation: Omit<Reservation, 'id'>): Promise<void> {
    const reservationsRef = collection(this.firestore, 'reservations');

    // Convert Dates to Firestore Timestamps if needed, or keep as Date objects
    // Firestore accepts Date objects directly in newer SDKs
    await addDoc(reservationsRef, {
      ...reservation,
      startDate: Timestamp.fromDate(reservation.startDate),
      endDate: Timestamp.fromDate(reservation.endDate),
      status: 'confirmed', // Default status
    });
  }
}
